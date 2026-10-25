use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::thread;
use std::time::Duration;

#[cfg(target_os = "linux")]
const FEATURE_REPORT_SIGNATURE: [u8; 6] = [0x95, 0x40, 0x75, 0x08, 0xb1, 0x02];

#[cfg(target_os = "linux")]
const fn hidiocsfeature(len: usize) -> libc::c_ulong {
    (0xC0004806u64 | ((len as u64) << 16)) as libc::c_ulong
}

#[cfg(target_os = "linux")]
const fn hidiocgfeature(len: usize) -> libc::c_ulong {
    (0xC0004807u64 | ((len as u64) << 16)) as libc::c_ulong
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BridgeStatus {
    pub connected: bool,
    pub dongle_only: bool,
    pub device_node: Option<String>,
    pub has_feature_report: bool,
    pub writable: bool,
    pub error: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PacketItem {
    pub bytes: Vec<u8>,
    pub expect_ack: Option<bool>,
    pub delay_ms: Option<u64>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExecResponse {
    pub ok: bool,
    pub device_node: Option<String>,
    pub replies: Vec<Option<Vec<u8>>>,
    pub error: Option<String>,
}

#[cfg(target_os = "linux")]
fn contains_subslice(haystack: &[u8], needle: &[u8]) -> bool {
    haystack
        .windows(needle.len())
        .any(|window| window == needle)
}

#[cfg(target_os = "linux")]
fn scan_gmk67_hidraw() -> (Vec<String>, Vec<String>) {
    let mut feature_nodes = Vec::new();
    let mut dongle_nodes = Vec::new();

    let Ok(entries) = fs::read_dir("/sys/class/hidraw") else {
        return (feature_nodes, dongle_nodes);
    };

    let mut paths: Vec<PathBuf> = entries
        .filter_map(|e| e.ok().map(|d| d.path()))
        .collect();
    paths.sort();

    for sys_path in paths {
        let uevent_path = sys_path.join("device/uevent");
        let desc_path = sys_path.join("device/report_descriptor");

        let Ok(uevent) = fs::read_to_string(&uevent_path) else {
            continue;
        };
        let uevent_upper = uevent.to_uppercase();
        if !uevent_upper.contains("05AC") || !uevent_upper.contains("024F") {
            continue;
        }

        let Ok(desc_bytes) = fs::read(&desc_path) else {
            continue;
        };

        let Some(name) = sys_path.file_name().and_then(|s| s.to_str()) else {
            continue;
        };
        let dev_node = format!("/dev/{}", name);

        if contains_subslice(&desc_bytes, &FEATURE_REPORT_SIGNATURE) {
            feature_nodes.push(dev_node);
        } else if uevent_upper.contains("DONGLE") {
            dongle_nodes.push(dev_node);
        }
    }

    (feature_nodes, dongle_nodes)
}

#[cfg(target_os = "linux")]
fn check_rw_access(dev_node: &str) -> bool {
    let Ok(c_path) = std::ffi::CString::new(dev_node) else {
        return false;
    };
    unsafe { libc::access(c_path.as_ptr(), libc::R_OK | libc::W_OK) == 0 }
}

#[tauri::command]
fn gmk67_status() -> BridgeStatus {
    #[cfg(target_os = "linux")]
    {
        let (feature_nodes, dongle_nodes) = scan_gmk67_hidraw();

        if feature_nodes.is_empty() {
            if !dongle_nodes.is_empty() {
                return BridgeStatus {
                    connected: false,
                    dongle_only: true,
                    device_node: None,
                    has_feature_report: false,
                    writable: false,
                    error: Some(
                        "2.4G USB Dongle detected (05AC:024F), which does not support EEPROM programming. Connect the GMK67 via USB cable (Wired mode)."
                            .to_string(),
                    ),
                };
            }
            return BridgeStatus {
                connected: false,
                dongle_only: false,
                device_node: None,
                has_feature_report: false,
                writable: false,
                error: Some("GMK67 (05AC:024F) not found in Wired USB mode.".to_string()),
            };
        }

        let dev_node = feature_nodes[0].clone();
        let writable = check_rw_access(&dev_node);
        let error = if writable {
            None
        } else {
            Some(format!(
                "Permission denied on {}. Install the udev rule to grant access.",
                dev_node
            ))
        };

        BridgeStatus {
            connected: writable,
            dongle_only: false,
            device_node: Some(dev_node),
            has_feature_report: true,
            writable,
            error,
        }
    }

    #[cfg(not(target_os = "linux"))]
    {
        let Ok(api) = hidapi::HidApi::new() else {
            return BridgeStatus {
                connected: false,
                dongle_only: false,
                device_node: None,
                has_feature_report: false,
                writable: false,
                error: Some("Failed to initialize native HID subsystem.".to_string()),
            };
        };

        let mut dongle_found = false;
        for dev in api.device_list() {
            if dev.vendor_id() == 0x05AC && dev.product_id() == 0x024F {
                let prod = dev.product_string().unwrap_or("").to_uppercase();
                if prod.contains("DONGLE") {
                    dongle_found = true;
                    continue;
                }
                if dev.interface_number() == 0 || dev.usage_page() == 0x0001 {
                    return BridgeStatus {
                        connected: true,
                        dongle_only: false,
                        device_node: Some(dev.path().to_string_lossy().into_owned()),
                        has_feature_report: true,
                        writable: true,
                        error: None,
                    };
                }
            }
        }

        BridgeStatus {
            connected: false,
            dongle_only: dongle_found,
            device_node: None,
            has_feature_report: false,
            writable: false,
            error: Some(if dongle_found {
                "2.4G USB Dongle detected. Connect the GMK67 via USB cable (Wired mode).".to_string()
            } else {
                "GMK67 (05AC:024F) not found in Wired USB mode.".to_string()
            }),
        }
    }
}

#[tauri::command]
fn gmk67_exec(packets: Vec<PacketItem>) -> ExecResponse {
    #[cfg(target_os = "linux")]
    {
        use std::os::unix::io::IntoRawFd;

        let (feature_nodes, dongle_nodes) = scan_gmk67_hidraw();

        if feature_nodes.is_empty() {
            let msg = if !dongle_nodes.is_empty() {
                "Keyboard is in 2.4G Wireless Dongle mode. Please switch to Wired USB mode to flash changes to the GMK67."
            } else {
                "GMK67 (05AC:024F) not connected in Wired USB mode."
            };
            return ExecResponse {
                ok: false,
                device_node: None,
                replies: Vec::new(),
                error: Some(msg.to_string()),
            };
        }

        let dev_node = feature_nodes[0].clone();
        let file = match fs::OpenOptions::new().read(true).write(true).open(&dev_node) {
            Ok(f) => f,
            Err(e) => {
                return ExecResponse {
                    ok: false,
                    device_node: Some(dev_node.clone()),
                    replies: Vec::new(),
                    error: Some(format!("Cannot open {}: {}", dev_node, e)),
                };
            }
        };

        let fd = file.into_raw_fd();
        let mut replies = Vec::with_capacity(packets.len());

        let result: Result<(), String> = (|| {
            for pkt in packets {
                if pkt.bytes.len() != 64 {
                    return Err(format!(
                        "Packet must be 64 bytes, got {}",
                        pkt.bytes.len()
                    ));
                }
                let expect_ack = pkt.expect_ack.unwrap_or(false);
                let delay_ms = pkt.delay_ms.unwrap_or(15);

                let mut buf = [0u8; 65];
                buf[0] = 0x00;
                buf[1..65].copy_from_slice(&pkt.bytes);

                let rc = unsafe { libc::ioctl(fd, hidiocsfeature(65), buf.as_mut_ptr()) };
                if rc < 0 {
                    let err = std::io::Error::last_os_error();
                    return Err(format!("HIDIOCSFEATURE failed on {}: {}", dev_node, err));
                }

                thread::sleep(Duration::from_millis(delay_ms));

                if expect_ack {
                    let mut rbuf = [0u8; 65];
                    let rrc = unsafe { libc::ioctl(fd, hidiocgfeature(65), rbuf.as_mut_ptr()) };
                    if rrc < 0 {
                        let err = std::io::Error::last_os_error();
                        return Err(format!("HIDIOCGFEATURE failed on {}: {}", dev_node, err));
                    }

                    if rbuf[4] == 0xFF {
                        thread::sleep(Duration::from_millis(delay_ms));
                        let rc2 = unsafe { libc::ioctl(fd, hidiocsfeature(65), buf.as_mut_ptr()) };
                        if rc2 < 0 {
                            let err = std::io::Error::last_os_error();
                            return Err(format!(
                                "HIDIOCSFEATURE retry failed on {}: {}",
                                dev_node, err
                            ));
                        }
                        thread::sleep(Duration::from_millis(delay_ms));
                        let _ = unsafe { libc::ioctl(fd, hidiocgfeature(65), rbuf.as_mut_ptr()) };
                    }

                    replies.push(Some(rbuf[1..65].to_vec()));
                } else {
                    replies.push(None);
                }
            }
            Ok(())
        })();

        unsafe {
            libc::close(fd);
        }

        match result {
            Ok(()) => ExecResponse {
                ok: true,
                device_node: Some(dev_node),
                replies,
                error: None,
            },
            Err(err_msg) => ExecResponse {
                ok: false,
                device_node: Some(dev_node),
                replies: Vec::new(),
                error: Some(err_msg),
            },
        }
    }

    #[cfg(not(target_os = "linux"))]
    {
        let Ok(api) = hidapi::HidApi::new() else {
            return ExecResponse {
                ok: false,
                device_node: None,
                replies: Vec::new(),
                error: Some("Failed to initialize native HID subsystem.".to_string()),
            };
        };

        let target_info = api.device_list().find(|dev| {
            dev.vendor_id() == 0x05AC
                && dev.product_id() == 0x024F
                && !dev.product_string().unwrap_or("").to_uppercase().contains("DONGLE")
                && (dev.interface_number() == 0 || dev.usage_page() == 0x0001)
        });

        let Some(dev_info) = target_info else {
            return ExecResponse {
                ok: false,
                device_node: None,
                replies: Vec::new(),
                error: Some("GMK67 (05AC:024F) not found in Wired USB mode.".to_string()),
            };
        };

        let path_str = dev_info.path().to_string_lossy().into_owned();
        let device = match dev_info.open_device(&api) {
            Ok(d) => d,
            Err(e) => {
                return ExecResponse {
                    ok: false,
                    device_node: Some(path_str),
                    replies: Vec::new(),
                    error: Some(format!("Failed to open GMK67 HID interface: {}", e)),
                };
            }
        };

        let mut replies = Vec::with_capacity(packets.len());
        for pkt in packets {
            if pkt.bytes.len() != 64 {
                return ExecResponse {
                    ok: false,
                    device_node: Some(path_str),
                    replies: Vec::new(),
                    error: Some(format!("Packet must be 64 bytes, got {}", pkt.bytes.len())),
                };
            }
            let expect_ack = pkt.expect_ack.unwrap_or(false);
            let delay_ms = pkt.delay_ms.unwrap_or(15);

            let mut buf = [0u8; 65];
            buf[0] = 0x00;
            buf[1..65].copy_from_slice(&pkt.bytes);

            if let Err(e) = device.send_feature_report(&buf) {
                return ExecResponse {
                    ok: false,
                    device_node: Some(path_str),
                    replies: Vec::new(),
                    error: Some(format!("send_feature_report failed: {}", e)),
                };
            }
            thread::sleep(Duration::from_millis(delay_ms));

            if expect_ack {
                let mut rbuf = [0u8; 65];
                rbuf[0] = 0x00;
                if let Err(e) = device.get_feature_report(&mut rbuf) {
                    return ExecResponse {
                        ok: false,
                        device_node: Some(path_str),
                        replies: Vec::new(),
                        error: Some(format!("get_feature_report failed: {}", e)),
                    };
                }
                if rbuf[4] == 0xFF {
                    thread::sleep(Duration::from_millis(delay_ms));
                    let _ = device.send_feature_report(&buf);
                    thread::sleep(Duration::from_millis(delay_ms));
                    let _ = device.get_feature_report(&mut rbuf);
                }
                replies.push(Some(rbuf[1..65].to_vec()));
            } else {
                replies.push(None);
            }
        }

        ExecResponse {
            ok: true,
            device_node: Some(path_str),
            replies,
            error: None,
        }
    }
}

fn get_config_file_path() -> PathBuf {
    if let Ok(home) = std::env::var("HOME") {
        Path::new(&home).join(".config/gmk67-via/config.json")
    } else if let Ok(appdata) = std::env::var("APPDATA") {
        Path::new(&appdata).join("gmk67-via/config.json")
    } else {
        PathBuf::from(".gmk67-config.json")
    }
}

#[tauri::command]
fn gmk67_load_config() -> Option<String> {
    let path = get_config_file_path();
    if path.exists() {
        return fs::read_to_string(path).ok();
    }
    let fallback = Path::new("/home/arsenii/gmk67/.gmk67-config.json");
    if fallback.exists() {
        return fs::read_to_string(fallback).ok();
    }
    None
}

#[tauri::command]
fn gmk67_save_config(config_json: String) -> Result<(), String> {
    let path = get_config_file_path();
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::write(path, config_json).map_err(|e| e.to_string())
}

#[tauri::command]
fn gmk67_setup_udev() -> Result<(), String> {
    #[cfg(target_os = "linux")]
    {
        let script = "printf '%s\\n' 'KERNEL==\"hidraw*\", ATTRS{idVendor}==\"05ac\", ATTRS{idProduct}==\"024f\", MODE=\"0666\", TAG+=\"uaccess\"' > /etc/udev/rules.d/99-gmk67.rules && udevadm control --reload-rules && udevadm trigger";
        let status = std::process::Command::new("pkexec")
            .arg("sh")
            .arg("-c")
            .arg(script)
            .status()
            .map_err(|e| format!("Failed to launch pkexec: {}", e))?;

        if status.success() {
            thread::sleep(Duration::from_millis(300));
            Ok(())
        } else {
            Err("Permission setup canceled or failed.".to_string())
        }
    }

    #[cfg(not(target_os = "linux"))]
    {
        Ok(())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            gmk67_status,
            gmk67_exec,
            gmk67_load_config,
            gmk67_save_config,
            gmk67_setup_udev
        ])
        .run(tauri::generate_context!())
        .expect("error while running GMK67 Tauri application");
}
