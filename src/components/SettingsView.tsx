import React from 'react';
import { Clock, Lock, Laptop, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { PacketLogEntry } from '../driver/gmk67';

export interface DeviceSettingsState {
  sleepMinutes: number;
  lockWinKey: boolean;
  swapWinAlt: boolean;
}

interface SettingsViewProps {
  settings: DeviceSettingsState;
  onChangeSettings: (next: DeviceSettingsState) => void;
  onSaveSettings: () => void;
  isSaving: boolean;
  statusMessage: string | null;
  statusType: 'info' | 'success' | 'error';
  packetLogs?: PacketLogEntry[];
  onClearLogs?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onChangeSettings,
  onSaveSettings,
  isSaving,
  statusMessage,
  statusType,
}) => {
  return (
    <div className="flex-1 flex flex-col bg-[#1b1b1e] border-t border-[#2c2c31] min-h-0 select-none">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-xl mx-auto">
          <div className="space-y-4 bg-[#161618] p-5 rounded-lg border border-[#27272c]">
            <div className="pb-1 border-b border-[#242427] flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#e4e4e7]">
                Hardware Configuration
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#d4d4d8] flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#d89587]" />
                  <span>Auto-Sleep Timeout</span>
                </label>
                <span className="text-xs font-mono font-semibold text-[#d89587]">
                  {settings.sleepMinutes} {settings.sleepMinutes === 1 ? 'minute' : 'minutes'}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={60}
                step={1}
                value={settings.sleepMinutes}
                onChange={(e) =>
                  onChangeSettings({
                    ...settings,
                    sleepMinutes: Number(e.target.value),
                  })
                }
                className="w-full accent-[#d89587] bg-[#242427] h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#71717a]">
                <span>1 min</span>
                <span>15 min</span>
                <span>30 min</span>
                <span>45 min</span>
                <span>60 min</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between py-2.5 px-3 rounded bg-[#1b1b1e] border border-[#27272c]">
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-[#d89587]" />
                <div>
                  <div className="text-xs font-semibold text-[#e4e4e7]">
                    Windows Key Lock
                  </div>
                  <div className="text-[11px] text-[#71717a]">
                    Disables Left/Right Win keys to prevent accidental focus loss
                  </div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.lockWinKey}
                onClick={() =>
                  onChangeSettings({
                    ...settings,
                    lockWinKey: !settings.lockWinKey,
                  })
                }
                className={`w-10 h-5 rounded-full transition-colors p-0.5 flex items-center ${
                  settings.lockWinKey ? 'bg-[#d89587]' : 'bg-[#2c2c31]'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-[#141416] transition-transform ${
                    settings.lockWinKey ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-2.5 px-3 rounded bg-[#1b1b1e] border border-[#27272c]">
              <div className="flex items-center gap-2.5">
                <Laptop className="w-4 h-4 text-[#d89587]" />
                <div>
                  <div className="text-xs font-semibold text-[#e4e4e7]">
                    Swap Win / Alt (Mac Mode)
                  </div>
                  <div className="text-[11px] text-[#71717a]">
                    Swaps Left Win and Left Alt modifiers
                  </div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.swapWinAlt}
                onClick={() =>
                  onChangeSettings({
                    ...settings,
                    swapWinAlt: !settings.swapWinAlt,
                  })
                }
                className={`w-10 h-5 rounded-full transition-colors p-0.5 flex items-center ${
                  settings.swapWinAlt ? 'bg-[#d89587]' : 'bg-[#2c2c31]'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-[#141416] transition-transform ${
                    settings.swapWinAlt ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="h-11 px-5 bg-[#141416] border-t border-[#2c2c31] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-xs">
          {statusMessage ? (
            <div
              className={`flex items-center gap-1.5 font-mono text-[11px] ${
                statusType === 'error'
                  ? 'text-[#f87171]'
                  : statusType === 'success'
                  ? 'text-[#34d399]'
                  : 'text-[#a1a1aa]'
              }`}
            >
              {statusType === 'error' ? (
                <AlertCircle className="w-3.5 h-3.5" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#d89587]" />
              )}
              <span>{statusMessage}</span>
            </div>
          ) : (
            <span className="text-[11px] font-mono text-[#71717a]">
              SLEEP {settings.sleepMinutes}M • WIN LOCK {settings.lockWinKey ? 'ON' : 'OFF'} • MAC MODE {settings.swapWinAlt ? 'ON' : 'OFF'}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onSaveSettings}
          disabled={isSaving}
          className="h-7 px-4 rounded bg-[#d89587] hover:bg-[#c48b7f] active:bg-[#b57d71] text-[#141416] text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? 'Saving...' : 'Save Settings to Keyboard'}</span>
        </button>
      </div>
    </div>
  );
};
