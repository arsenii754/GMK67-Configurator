import React, { useState, useRef, useEffect } from 'react';
import { LIGHTING_MODES } from '../constants/keys';
import { LightingState } from './Keyboard';
import { Sun, Gauge, ArrowLeftRight, Sparkles, Save, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';

interface LightingViewProps {
  lighting: LightingState;
  onChangeLighting: (next: LightingState) => void;
  onApplyLighting: (next?: LightingState) => void;
  isSaving: boolean;
  isConnected: boolean;
  statusMessage: string | null;
  statusType: 'info' | 'success' | 'error';
}

const RETRO_SWATCHES = [
  { hex: '#d89587', name: 'Retro Salmon' },
  { hex: '#e4e4e7', name: 'Warm White' },
  { hex: '#f59e0b', name: 'Amber Gold' },
  { hex: '#10b981', name: 'Mint Jade' },
  { hex: '#38bdf8', name: 'Ice Cyan' },
  { hex: '#818cf8', name: 'Soft Indigo' },
  { hex: '#f43f5e', name: 'Crimson Rose' },
  { hex: '#a855f7', name: 'Lavender' },
];

export const LightingView: React.FC<LightingViewProps> = ({
  lighting,
  onChangeLighting,
  onApplyLighting,
  isSaving,
  isConnected,
  statusMessage,
  statusType,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentModeInfo =
    LIGHTING_MODES.find((m) => m.id === lighting.mode) || LIGHTING_MODES[0];

  const updateField = <K extends keyof LightingState>(
    field: K,
    value: LightingState[K]
  ) => {
    const updated = { ...lighting, [field]: value };

    if (field === 'mode') {
      const mInfo = LIGHTING_MODES.find((m) => m.id === Number(value));
      if (mInfo) {
        if (mInfo.supportsSingleColor && !mInfo.supportsRainbow) {
          updated.isSingleColor = true;
        } else if (!mInfo.supportsSingleColor && mInfo.supportsRainbow) {
          updated.isSingleColor = false;
        } else if (mInfo.id === 1) {
          updated.isSingleColor = true;
        }
      }
    } else if (field === 'colorHex') {
      if (currentModeInfo.supportsSingleColor) {
        updated.isSingleColor = true;
      }
    }

    onChangeLighting(updated);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#1b1b1e] border-t border-[#2c2c31] min-h-0 select-none">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-5 bg-[#161618] p-5 rounded-lg border border-[#27272c]">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a1a1aa] flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#d89587]" />
                  <span>Lighting Effect</span>
                </label>
              </div>

              <div ref={dropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="w-full h-9 px-3 rounded bg-[#242427] hover:bg-[#2a2a2e] border border-[#34343a] text-xs font-medium text-[#e4e4e7] flex items-center justify-between focus:outline-none focus:border-[#d89587] transition-colors"
                >
                  <span>{currentModeInfo.name}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#a1a1aa] transition-transform ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded bg-[#1b1b1e] border border-[#34343a] shadow-2xl z-30 py-1">
                    {LIGHTING_MODES.map((m) => {
                      const isSelected = m.id === lighting.mode;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            updateField('mode', m.id);
                            setDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-1.5 text-left text-xs font-medium flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-[#d89587] text-[#141416] font-semibold'
                              : 'text-[#e4e4e7] hover:bg-[#2c2c31]'
                          }`}
                        >
                          <span>{m.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a1a1aa]">
                Color Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={!currentModeInfo.supportsSingleColor}
                  onClick={() => updateField('isSingleColor', true)}
                  className={`h-8 rounded text-xs font-semibold border transition-colors ${
                    lighting.isSingleColor && currentModeInfo.supportsSingleColor
                      ? 'bg-[#d89587] text-[#141416] border-[#d89587]'
                      : 'bg-[#242427] text-[#a1a1aa] border-[#323238] disabled:opacity-40'
                  }`}
                >
                  Single Color
                </button>
                <button
                  type="button"
                  disabled={!currentModeInfo.supportsRainbow}
                  onClick={() => updateField('isSingleColor', false)}
                  className={`h-8 rounded text-xs font-semibold border transition-colors ${
                    !lighting.isSingleColor && currentModeInfo.supportsRainbow
                      ? 'bg-[#d89587] text-[#141416] border-[#d89587]'
                      : 'bg-[#242427] text-[#a1a1aa] border-[#323238] disabled:opacity-40'
                  }`}
                >
                  Spectrum / Rainbow
                </button>
              </div>
            </div>

            <div
              className={`space-y-3 transition-opacity ${
                currentModeInfo.supportsSingleColor
                  ? lighting.isSingleColor
                    ? 'opacity-100'
                    : 'opacity-75'
                  : 'opacity-40 pointer-events-none'
              }`}
            >
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a1a1aa]">
                  LED Color (HEX / RGB)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={lighting.colorHex}
                    onChange={(e) => updateField('colorHex', e.target.value)}
                    className="w-6 h-6 rounded bg-transparent border border-[#34343a] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={lighting.colorHex.toUpperCase()}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                        updateField('colorHex', val);
                      }
                    }}
                    className="w-24 h-7 px-2 rounded bg-[#242427] border border-[#34343a] font-mono text-xs text-[#e4e4e7] uppercase focus:outline-none focus:border-[#d89587]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap pt-1">
                {RETRO_SWATCHES.map((swatch) => {
                  const selected =
                    lighting.colorHex.toLowerCase() === swatch.hex.toLowerCase();
                  return (
                    <button
                      key={swatch.hex}
                      type="button"
                      title={swatch.name}
                      onClick={() => updateField('colorHex', swatch.hex)}
                      style={{ backgroundColor: swatch.hex }}
                      className={`w-7 h-7 rounded border transition-transform ${
                        selected
                          ? 'ring-2 ring-white scale-105 border-transparent'
                          : 'border-black/40 hover:scale-105'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-5 bg-[#161618] p-5 rounded-lg border border-[#27272c]">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a1a1aa] flex items-center gap-2">
                  <Sun className="w-3.5 h-3.5 text-[#d89587]" />
                  <span>Brightness Level</span>
                </label>
                <span className="text-xs font-mono font-semibold text-[#e4e4e7]">
                  {lighting.brightness} / 5
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={lighting.brightness}
                onChange={(e) =>
                  updateField('brightness', Number(e.target.value))
                }
                className="w-full accent-[#d89587] bg-[#242427] h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#71717a]">
                <span>1 (Min)</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5 (Max)</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a1a1aa] flex items-center gap-2">
                  <Gauge className="w-3.5 h-3.5 text-[#d89587]" />
                  <span>Animation Speed</span>
                </label>
                <span className="text-xs font-mono font-semibold text-[#e4e4e7]">
                  {lighting.speed} / 5
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={lighting.speed}
                onChange={(e) => updateField('speed', Number(e.target.value))}
                className="w-full accent-[#d89587] bg-[#242427] h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#71717a]">
                <span>1 (Slow)</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5 (Fast)</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a1a1aa] flex items-center gap-2">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-[#d89587]" />
                  <span>Animation Direction</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateField('direction', 0)}
                  className={`h-8 rounded text-xs font-semibold border transition-colors ${
                    lighting.direction === 0
                      ? 'bg-[#d89587] text-[#141416] border-[#d89587]'
                      : 'bg-[#242427] text-[#a1a1aa] border-[#323238] hover:text-[#e4e4e7]'
                  }`}
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => updateField('direction', 1)}
                  className={`h-8 rounded text-xs font-semibold border transition-colors ${
                    lighting.direction === 1
                      ? 'bg-[#d89587] text-[#141416] border-[#d89587]'
                      : 'bg-[#242427] text-[#a1a1aa] border-[#323238] hover:text-[#e4e4e7]'
                  }`}
                >
                  Reverse
                </button>
              </div>
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
              {currentModeInfo.name.toUpperCase()} • BRT {lighting.brightness} • SPD {lighting.speed}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onApplyLighting()}
          disabled={isSaving}
          className="h-7 px-4 rounded bg-[#d89587] hover:bg-[#c48b7f] active:bg-[#b57d71] text-[#141416] text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? 'Applying...' : 'Apply Lighting to Keyboard'}</span>
        </button>
      </div>
    </div>
  );
};

