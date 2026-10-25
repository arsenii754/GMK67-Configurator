import React from 'react';
import {
  GMK67_LAYOUT,
  HID_CODE_TO_EVENT_CODE,
  KeyAssignment,
  PhysicalKey,
} from '../constants/keys';

export interface LightingState {
  mode: number;
  colorHex: string;
  isSingleColor: boolean;
  brightness: number;
  speed: number;
  direction: number;
}

interface KeyboardProps {
  activeLayer: 0 | 1;
  onSelectLayer: (layer: 0 | 1) => void;
  selectedKeyIndex: number | null;
  onSelectKey: (keyIndex: number) => void;
  layerAssignments: Record<number, KeyAssignment>;
  lighting: LightingState;
  showLightingPreview?: boolean;
  isKeyTester?: boolean;
  pressedCodes?: Set<string>;
  testedCodes?: Set<string>;
  onResetKeyToDefault?: (keyIndex: number) => void;
}

const UNIT_PX = 54;
const GAP_PX = 4;

export const Keyboard: React.FC<KeyboardProps> = ({
  activeLayer,
  onSelectLayer,
  selectedKeyIndex,
  onSelectKey,
  layerAssignments,
  lighting,
  showLightingPreview = false,
  isKeyTester = false,
  pressedCodes,
  testedCodes,
}) => {
  const rows = [0, 1, 2, 3, 4].map((r) =>
    GMK67_LAYOUT.filter((k) => k.row === r)
  );

  const getKeyLedStyle = (key: PhysicalKey, colIdx: number): React.CSSProperties => {
    if (!showLightingPreview || lighting.mode === 20) {
      return {};
    }

    const alpha = (lighting.brightness / 5) * 0.65;
    let color = lighting.colorHex;

    if (!lighting.isSingleColor || [6, 8, 9, 10, 11, 12, 16, 17, 18, 19].includes(lighting.mode)) {
      const dirSign = lighting.direction === 1 ? -1 : 1;
      const hue = ((colIdx * 22 * dirSign + key.row * 35) % 360 + 360) % 360;
      color = `hsl(${hue}, 70%, 62%)`;
    }

    return {
      borderBottomColor: color,
      boxShadow: `0 2px 0 0 ${color}, inset 0 -1px 0 0 ${color}`,
      opacity: 0.75 + alpha * 0.25,
    };
  };

  return (
    <div className="w-full flex flex-col items-center justify-center px-6 py-3 select-none">
      <div className="w-full max-w-[916px] flex items-center justify-between mb-2.5">
        {!isKeyTester ? (
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold tracking-[0.18em] text-[#a1a1aa] uppercase">
              LAYER
            </span>
            <div className="inline-flex items-center bg-[#141416] p-0.5 rounded border border-[#2c2c31]">
              {([0, 1] as const).map((layer) => {
                const isActive = activeLayer === layer;
                return (
                  <button
                    key={layer}
                    onClick={() => onSelectLayer(layer)}
                    className={`w-7 h-6 rounded-sm text-xs font-mono font-semibold transition-colors flex items-center justify-center ${
                      isActive
                        ? 'bg-[#d89587] text-[#141416] shadow-sm'
                        : 'text-[#a1a1aa] hover:text-[#e4e4e7]'
                    }`}
                  >
                    {layer}
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] text-[#71717a] hidden sm:inline">
              {activeLayer === 0 ? 'Base Layer' : 'Fn Layer'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold tracking-[0.18em] text-[#d89587] uppercase">
              KEY TESTER
            </span>
            <span className="text-[11px] text-[#71717a]">
              Press keys on your keyboard to test switch actuation
            </span>
          </div>
        )}
      </div>

      <div
        className="relative rounded-[14px] p-[18px] bg-[#1b1b1e] border border-[#2e2e34] shadow-[0_20px_45px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.04)]"
      >
        <div className="rounded-[9px] p-[10px] bg-[#111113] border border-[#09090b] shadow-[inset_0_3px_8px_rgba(0,0,0,0.85)] flex flex-col gap-[4px]">
          {rows.map((rowKeys, rowIdx) => (
            <div
              key={rowIdx}
              className="flex items-center"
              style={{ gap: `${GAP_PX}px`, height: `${UNIT_PX}px` }}
            >
              {rowKeys.map((key, colIdx) => {
                const pixelWidth =
                  key.width * UNIT_PX + (key.width - 1) * GAP_PX;
                const gapLeft = key.gapBefore
                  ? key.gapBefore * UNIT_PX + key.gapBefore * GAP_PX
                  : 0;

                const isSelected = !isKeyTester && selectedKeyIndex === key.keyIndex;
                const customAssign = layerAssignments[key.keyIndex];
                const isRemapped =
                  customAssign !== undefined && customAssign.category !== 0x00;

                let mainLegend = key.label;
                let topSubLegend = key.subLabel;

                if (activeLayer === 1 && !isRemapped) {
                  mainLegend = key.fnDefaultLabel || '▽';
                  topSubLegend = key.label;
                }

                if (isRemapped && customAssign) {
                  mainLegend = customAssign.label;
                  topSubLegend = customAssign.subLabel;
                }

                const effectiveEventCode =
                  customAssign &&
                  customAssign.category === 0x02 &&
                  HID_CODE_TO_EVENT_CODE[customAssign.hidCode]
                    ? HID_CODE_TO_EVENT_CODE[customAssign.hidCode]
                    : key.eventCode;

                const isPressed =
                  isKeyTester && effectiveEventCode
                    ? pressedCodes?.has(effectiveEventCode)
                    : false;
                const isTested =
                  isKeyTester && effectiveEventCode
                    ? testedCodes?.has(effectiveEventCode)
                    : false;

                if (key.isKnob) {
                  return (
                    <div
                      key={key.id}
                      style={{
                        width: `${pixelWidth}px`,
                        height: `${UNIT_PX}px`,
                        marginLeft: gapLeft ? `${gapLeft}px` : undefined,
                      }}
                      className="relative flex items-center justify-center"
                    >
                      <button
                        type="button"
                        onClick={() => onSelectKey(key.keyIndex)}
                        title="Rotary Encoder Knob - Click to configure push action"
                        className={`w-[48px] h-[48px] rounded-full relative flex flex-col items-center justify-center transition-transform active:scale-95 ${
                          isSelected
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-[#111113]'
                            : 'hover:brightness-110'
                        }`}
                        style={{
                          background:
                            'radial-gradient(circle at 35% 30%, #3d3d45 0%, #242429 65%, #18181b 100%)',
                          boxShadow:
                            '0 4px 8px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.18)',
                          border: '2px solid #3f3f46',
                        }}
                      >
                        <div className="w-[36px] h-[36px] rounded-full border border-dashed border-[#52525b]/70 flex flex-col items-center justify-center">
                          <span className="text-[8px] font-mono font-bold tracking-tighter text-[#e4e4e7] leading-none">
                            {isRemapped ? mainLegend : 'MUTE'}
                          </span>
                          <span className="text-[7px] font-mono text-[#d89587] leading-none mt-0.5">
                            ENC
                          </span>
                        </div>
                      </button>
                    </div>
                  );
                }

                const isAccentKey = Boolean(key.isAccent);
                let capOuterBg = isAccentKey
                  ? 'linear-gradient(180deg, #d89587 0%, #bf7e70 100%)'
                  : key.isMod
                  ? 'linear-gradient(180deg, #27272c 0%, #1f1f23 100%)'
                  : 'linear-gradient(180deg, #303036 0%, #26262b 100%)';

                let capTopDishBg = isAccentKey
                  ? 'linear-gradient(180deg, #cf8c7e 0%, #d89587 100%)'
                  : key.isMod
                  ? 'linear-gradient(180deg, #232328 0%, #28282e 100%)'
                  : 'linear-gradient(180deg, #2a2a30 0%, #2f2f35 100%)';

                let textColor = isAccentKey ? 'text-[#141416]' : 'text-[#e4e4e7]';
                let subTextColor = isAccentKey
                  ? 'text-[#141416]/70'
                  : 'text-[#a1a1aa]';

                if (isPressed) {
                  capOuterBg = 'linear-gradient(180deg, #e4e4e7 0%, #d4d4d8 100%)';
                  capTopDishBg = 'linear-gradient(180deg, #d4d4d8 0%, #e4e4e7 100%)';
                  textColor = 'text-[#141416]';
                } else if (isTested) {
                  capOuterBg = 'linear-gradient(180deg, #3a4f41 0%, #2c3d32 100%)';
                  capTopDishBg = 'linear-gradient(180deg, #324539 0%, #3a4f41 100%)';
                  textColor = 'text-[#d1fae5]';
                }

                return (
                  <button
                    key={key.id}
                    type="button"
                    onClick={() => onSelectKey(key.keyIndex)}
                    style={{
                      width: `${pixelWidth}px`,
                      height: `${UNIT_PX}px`,
                      marginLeft: gapLeft ? `${gapLeft}px` : undefined,
                      background: capOuterBg,
                      boxShadow: isPressed
                        ? '0 1px 1px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.2)'
                        : '0 3px 0 #09090b, 0 4px 5px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.12)',
                      ...getKeyLedStyle(key, colIdx),
                    }}
                    className={`group relative rounded-[6px] p-[4px] pb-[7px] transition-transform duration-75 flex flex-col justify-between text-left focus:outline-none ${
                      isPressed ? 'translate-y-[2px]' : 'active:translate-y-[1px]'
                    } ${
                      isSelected
                        ? 'ring-2 ring-white z-10'
                        : 'border border-[#18181b]'
                    }`}
                  >
                    <div
                      style={{ background: capTopDishBg }}
                      className="w-full h-full rounded-[4px] px-1.5 py-1 flex flex-col justify-between relative border-t border-white/[0.07] shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]"
                    >
                      <div className="w-full flex items-center justify-between min-h-[11px]">
                        {topSubLegend ? (
                          <span
                            className={`text-[9px] font-medium leading-none ${subTextColor}`}
                          >
                            {topSubLegend}
                          </span>
                        ) : (
                          <span />
                        )}

                        {isRemapped && (
                          <span
                            title="Custom Remapped Key"
                            className={`w-1.5 h-1.5 rounded-full ${
                              isAccentKey ? 'bg-[#141416]' : 'bg-[#d89587]'
                            }`}
                          />
                        )}
                      </div>

                      <div className="w-full flex items-center justify-center my-auto">
                        <span
                          className={`${
                            mainLegend.length > 5
                              ? 'text-[10px]'
                              : mainLegend.length > 2
                              ? 'text-[11px]'
                              : 'text-[12px]'
                          } font-semibold tracking-tight leading-none truncate ${textColor}`}
                        >
                          {mainLegend}
                        </span>
                      </div>

                      <div className="w-full flex items-center justify-center h-[3px]">
                        {key.homing && (
                          <span
                            className={`w-3 h-[2px] rounded-full ${
                              isAccentKey ? 'bg-[#141416]/50' : 'bg-[#e4e4e7]/45'
                            }`}
                          />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

