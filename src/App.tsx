import React, { useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Header, TopTab } from './components/Header';
import { Keyboard, LightingState } from './components/Keyboard';
import { KeyPalette } from './components/KeyPalette';
import { LightingView } from './components/LightingView';
import { DeviceSettingsState, SettingsView } from './components/SettingsView';
import { GMK67_LAYOUT, KeyAssignment } from './constants/keys';
import { GMK67Driver, PacketLogEntry } from './driver/gmk67';
import { Keyboard as KeyboardIcon, Sun, Sliders, RotateCcw } from 'lucide-react';

type SidebarSection = 'KEYMAP' | 'LIGHTING' | 'SETTINGS';

const STORAGE_KEY = 'gmk67_via_config_v2';

interface SavedConfig {
  layer0Map?: Record<number, KeyAssignment>;
  layer1Map?: Record<number, KeyAssignment>;
  lighting?: LightingState;
  deviceSettings?: DeviceSettingsState;
}

const DEFAULT_LIGHTING: LightingState = {
  mode: 1,
  colorHex: '#d89587',
  isSingleColor: true,
  brightness: 4,
  speed: 3,
  direction: 0,
};

const DEFAULT_SETTINGS: DeviceSettingsState = {
  sleepMinutes: 5,
  lockWinKey: false,
  swapWinAlt: false,
};

function loadInitialLocalConfig(): SavedConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedConfig;
  } catch {
    return null;
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean.padEnd(6, '0');
  const num = parseInt(full, 16) || 0;
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  };
}

export const App: React.FC = () => {
  const [topTab, setTopTab] = useState<TopTab>('CONFIGURE');
  const [sidebarSection, setSidebarSection] = useState<SidebarSection>('KEYMAP');
  const [activeLayer, setActiveLayer] = useState<0 | 1>(0);
  const [selectedKeyIndex, setSelectedKeyIndex] = useState<number | null>(1);

  const [layer0Map, setLayer0Map] = useState<Record<number, KeyAssignment>>(
    () => loadInitialLocalConfig()?.layer0Map ?? {}
  );
  const [layer1Map, setLayer1Map] = useState<Record<number, KeyAssignment>>(
    () => loadInitialLocalConfig()?.layer1Map ?? {}
  );

  const [lighting, setLighting] = useState<LightingState>(
    () => ({ ...DEFAULT_LIGHTING, ...(loadInitialLocalConfig()?.lighting ?? {}) })
  );

  const [deviceSettings, setDeviceSettings] = useState<DeviceSettingsState>(
    () => ({ ...DEFAULT_SETTINGS, ...(loadInitialLocalConfig()?.deviceSettings ?? {}) })
  );

  const driverRef = useRef<GMK67Driver | null>(null);
  const diskHydratedRef = useRef<boolean>(loadInitialLocalConfig() !== null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error'>('info');
  const [packetLogs, setPacketLogs] = useState<PacketLogEntry[]>([]);

  const [pressedCodes, setPressedCodes] = useState<Set<string>>(new Set());
  const [testedCodes, setTestedCodes] = useState<Set<string>>(new Set());
  const [lastEventCode, setLastEventCode] = useState<string | null>(null);

  const appendPacketLog = (entry: PacketLogEntry) => {
    setPacketLogs((prev) => [entry, ...prev].slice(0, 60));
  };

  const showStatus = (
    msg: string,
    type: 'info' | 'success' | 'error' = 'info'
  ) => {
    setStatusMessage(msg);
    setStatusType(type);
  };

  useEffect(() => {
    const loadDiskCfg = async () => {
      try {
        let diskCfg: SavedConfig | null = null;
        if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
          const raw = await invoke<string | null>('gmk67_load_config');
          if (raw) diskCfg = JSON.parse(raw) as SavedConfig;
        } else {
          const res = await fetch('/api/gmk67/config');
          if (res.ok) diskCfg = (await res.json()) as SavedConfig | null;
        }
        if (diskCfg && !loadInitialLocalConfig()) {
          if (diskCfg.layer0Map) setLayer0Map(diskCfg.layer0Map);
          if (diskCfg.layer1Map) setLayer1Map(diskCfg.layer1Map);
          if (diskCfg.lighting) {
            setLighting({ ...DEFAULT_LIGHTING, ...diskCfg.lighting });
          }
          if (diskCfg.deviceSettings) {
            setDeviceSettings({ ...DEFAULT_SETTINGS, ...diskCfg.deviceSettings });
          }
        }
      } catch {
      } finally {
        diskHydratedRef.current = true;
      }
    };

    loadDiskCfg();

    GMK67Driver.tryAutoConnect(appendPacketLog, (permErr) => {
      showStatus(permErr, 'error');
    }).then((drv) => {
      if (drv) {
        driverRef.current = drv;
        setIsConnected(true);
        showStatus('Connected to ZUOYA GMK67', 'success');
      }
    });

    if ('hid' in navigator) {
      const handleDisconnect = (e: HIDConnectionEvent) => {
        if (
          driverRef.current &&
          e.device === driverRef.current.getDevice()
        ) {
          driverRef.current = null;
          setIsConnected(false);
          showStatus('GMK67 disconnected', 'info');
        }
      };
      navigator.hid.addEventListener('disconnect', handleDisconnect);
      return () => {
        navigator.hid.removeEventListener('disconnect', handleDisconnect);
      };
    }
  }, []);

  useEffect(() => {
    const serialized = JSON.stringify({
      layer0Map,
      layer1Map,
      lighting,
      deviceSettings,
    });
    try {
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch {
    }
    if (diskHydratedRef.current) {
      if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
        invoke('gmk67_save_config', { configJson: serialized }).catch(() => {});
      }
    }
  }, [layer0Map, layer1Map, lighting, deviceSettings]);

  useEffect(() => {
    if (topTab !== 'KEY TESTER') return;

    const onKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      setLastEventCode(e.code);
      setPressedCodes((prev) => {
        const next = new Set(prev);
        next.add(e.code);
        return next;
      });
      setTestedCodes((prev) => {
        const next = new Set(prev);
        next.add(e.code);
        return next;
      });
    };

    const onKeyUp = (e: KeyboardEvent) => {
      e.preventDefault();
      setPressedCodes((prev) => {
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [topTab]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const drv = await GMK67Driver.connect(appendPacketLog);
      driverRef.current = drv;
      setIsConnected(true);
      showStatus('Connected to ZUOYA GMK67', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect';
      showStatus(msg, 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (driverRef.current) {
      await driverRef.current.disconnect();
      driverRef.current = null;
    }
    setIsConnected(false);
    showStatus('Disconnected from ZUOYA GMK67', 'info');
  };

  const handleAssignKey = (assignment: KeyAssignment) => {
    if (selectedKeyIndex === null) return;

    if (activeLayer === 0) {
      setLayer0Map((prev) => ({ ...prev, [selectedKeyIndex]: assignment }));
    } else {
      setLayer1Map((prev) => ({ ...prev, [selectedKeyIndex]: assignment }));
    }

    const targetKey = GMK67_LAYOUT.find((k) => k.keyIndex === selectedKeyIndex);
    showStatus(
      `Assigned ${assignment.label} to ${targetKey?.label || 'Space'} on Layer ${activeLayer}`,
      'info'
    );
  };

  const handleResetLayer = () => {
    if (activeLayer === 0) {
      setLayer0Map({});
    } else {
      setLayer1Map({});
    }
    showStatus(`Reset Layer ${activeLayer} to defaults`, 'info');
  };

  const handleSaveKeymapToKeyboard = async () => {
    let drv = driverRef.current;
    if (!drv || !isConnected) {
      try {
        setIsConnecting(true);
        drv = await GMK67Driver.connect(appendPacketLog);
        driverRef.current = drv;
        setIsConnected(true);
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Connect your GMK67 first';
        showStatus(msg, 'error');
        setIsConnecting(false);
        return;
      } finally {
        setIsConnecting(false);
      }
    }

    setIsSaving(true);
    try {
      const mapToWrite = activeLayer === 0 ? layer0Map : layer1Map;
      await drv.writeLayerKeymap(activeLayer, mapToWrite);
      showStatus(`Saved Layer ${activeLayer} keymap to keyboard`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Write failed';
      showStatus(`Write Error: ${msg}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyLighting = async (overrideLighting?: LightingState) => {
    const targetLighting = overrideLighting || lighting;
    let drv = driverRef.current;
    if (!drv || !isConnected) {
      try {
        setIsConnecting(true);
        drv = await GMK67Driver.connect(appendPacketLog);
        driverRef.current = drv;
        setIsConnected(true);
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Connect your GMK67 first to apply lighting';
        showStatus(msg, 'error');
        setIsConnecting(false);
        return;
      } finally {
        setIsConnecting(false);
      }
    }

    setIsSaving(true);
    try {
      const { r, g, b } = hexToRgb(targetLighting.colorHex);
      await drv.setLightingPreset({
        mode: targetLighting.mode,
        r,
        g,
        b,
        brightness: targetLighting.brightness,
        speed: targetLighting.speed,
        isSingleColor: targetLighting.isSingleColor,
        direction: targetLighting.direction,
      });
      showStatus('Applied lighting settings to keyboard', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lighting update failed';
      showStatus(`Write Error: ${msg}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDeviceSettings = async () => {
    let drv = driverRef.current;
    if (!drv || !isConnected) {
      try {
        setIsConnecting(true);
        drv = await GMK67Driver.connect(appendPacketLog);
        driverRef.current = drv;
        setIsConnected(true);
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Connect your GMK67 first to save settings';
        showStatus(msg, 'error');
        setIsConnecting(false);
        return;
      } finally {
        setIsConnecting(false);
      }
    }

    setIsSaving(true);
    try {
      await drv.setDeviceSettings(deviceSettings);
      showStatus('Saved hardware settings to keyboard', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Settings write failed';
      showStatus(`Write Error: ${msg}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectTopTab = (tab: TopTab) => {
    setTopTab(tab);
  };

  const activeLayerAssignments = activeLayer === 0 ? layer0Map : layer1Map;
  const currentKeyAssignment =
    selectedKeyIndex !== null
      ? activeLayerAssignments[selectedKeyIndex]
      : undefined;

  const activeSubView: SidebarSection = sidebarSection;

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#141416] text-[#e4e4e7]">
      <Header
        activeTab={topTab}
        onSelectTab={handleSelectTopTab}
        isConnected={isConnected}
        isConnecting={isConnecting}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {topTab !== 'KEY TESTER' && (
          <aside className="w-44 bg-[#18181b] border-r border-[#2c2c31] py-4 flex flex-col justify-between select-none shrink-0">
            <div className="space-y-1 px-2">
              <div className="px-3 pb-2 text-[10px] font-bold tracking-[0.18em] text-[#71717a] uppercase">
                CONFIGURE
              </div>

              {(
                [
                  {
                    id: 'KEYMAP',
                    label: 'KEYMAP',
                    icon: <KeyboardIcon className="w-3.5 h-3.5" />,
                  },
                  {
                    id: 'LIGHTING',
                    label: 'LIGHTING',
                    icon: <Sun className="w-3.5 h-3.5" />,
                  },
                  {
                    id: 'SETTINGS',
                    label: 'SETTINGS',
                    icon: <Sliders className="w-3.5 h-3.5" />,
                  },
                ] as const
              ).map((item) => {
                const active = activeSubView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setTopTab('CONFIGURE');
                      setSidebarSection(item.id);
                    }}
                    className={`w-full px-3 py-2.5 rounded text-xs font-semibold tracking-[0.14em] flex items-center gap-2.5 transition-colors ${
                      active
                        ? 'bg-[#2c2c31] text-[#e4e4e7] border-l-2 border-[#d89587]'
                        : 'text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#242427]/60'
                    }`}
                  >
                    <span className={active ? 'text-[#d89587]' : 'text-[#71717a]'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <div className="bg-[#141416] flex items-center justify-center shrink-0 overflow-x-auto">
            <Keyboard
              activeLayer={topTab === 'KEY TESTER' ? 0 : activeLayer}
              onSelectLayer={setActiveLayer}
              selectedKeyIndex={selectedKeyIndex}
              onSelectKey={(idx) => setSelectedKeyIndex(idx)}
              layerAssignments={
                topTab === 'KEY TESTER' ? layer0Map : activeLayerAssignments
              }
              lighting={lighting}
              showLightingPreview={activeSubView === 'LIGHTING'}
              isKeyTester={topTab === 'KEY TESTER'}
              pressedCodes={pressedCodes}
              testedCodes={testedCodes}
            />
          </div>

          {topTab === 'KEY TESTER' ? (
            <div className="flex-1 bg-[#1b1b1e] border-t border-[#2c2c31] p-6 flex flex-col items-center justify-center select-none">
              <div className="max-w-xl w-full bg-[#161618] border border-[#27272c] rounded-lg p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#e4e4e7]">
                    Switch Matrix Tester
                  </div>
                  <div className="text-xs text-[#a1a1aa]">
                    Tested Keys:{' '}
                    <span className="font-mono font-semibold text-[#d89587]">
                      {testedCodes.size} / {GMK67_LAYOUT.length}
                    </span>
                    {lastEventCode && (
                      <span className="ml-3 font-mono text-[#71717a]">
                        Last Event: <strong className="text-[#e4e4e7]">{lastEventCode}</strong>
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPressedCodes(new Set());
                    setTestedCodes(new Set());
                    setLastEventCode(null);
                  }}
                  className="h-8 px-3 rounded bg-[#242427] hover:bg-[#2c2c31] border border-[#34343a] text-xs font-medium text-[#e4e4e7] flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#d89587]" />
                  <span>Reset Matrix</span>
                </button>
              </div>
            </div>
          ) : activeSubView === 'KEYMAP' ? (
            <KeyPalette
              activeLayer={activeLayer}
              selectedKeyIndex={selectedKeyIndex}
              currentAssignment={currentKeyAssignment}
              onAssignKey={handleAssignKey}
              onResetLayer={handleResetLayer}
              onSaveToKeyboard={handleSaveKeymapToKeyboard}
              isSaving={isSaving}
              isConnected={isConnected}
              statusMessage={statusMessage}
              statusType={statusType}
            />
          ) : activeSubView === 'LIGHTING' ? (
            <LightingView
              lighting={lighting}
              onChangeLighting={setLighting}
              onApplyLighting={handleApplyLighting}
              isSaving={isSaving}
              isConnected={isConnected}
              statusMessage={statusMessage}
              statusType={statusType}
            />
          ) : (
            <SettingsView
              settings={deviceSettings}
              onChangeSettings={setDeviceSettings}
              onSaveSettings={handleSaveDeviceSettings}
              isSaving={isSaving}
              statusMessage={statusMessage}
              statusType={statusType}
              packetLogs={packetLogs}
              onClearLogs={() => setPacketLogs([])}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;

