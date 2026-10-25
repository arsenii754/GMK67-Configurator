# Zuoya GMK67 Configurator

VIA-style configurator for the Zuoya GMK67 mechanical keyboard (`05AC:024F`). Supports Layer 0 and Layer 1 key remapping, RGB lighting presets, hardware settings, and a matrix key tester.

## Linux Setup (udev rule)

> **Note:** On Linux, `/dev/hidraw*` devices are owned by `root` (`0600`) by default. Even native desktop apps require a one-time `udev` rule so your user account can read and write to the keyboard without `sudo`.

```bash
echo 'KERNEL=="hidraw*", ATTRS{idVendor}=="05ac", ATTRS{idProduct}=="024f", MODE="0666", TAG+="uaccess"' | sudo tee /etc/udev/rules.d/99-gmk67.rules
sudo udevadm control --reload-rules && sudo udevadm trigger
```

Connect the keyboard via USB cable (wired mode) before flashing changes.

## Development

Clone the repository, install dependencies, and run the app in development mode:

```bash
git clone https://github.com/arsenii754/gmk67-configurator
cd gmk67-configurator
npm install
npm run tauri dev
```

### Building for Release

To compile a release binary:

```bash
npm run tauri build
```

The binary is output to `src-tauri/target/release/gmk67-configurator`.
