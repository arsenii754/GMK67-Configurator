import React, { useState } from 'react';
import {
  GMK67_LAYOUT,
  KEY_PALETTE,
  KeyAssignment,
  KeyCategory,
  MODIFIER_BITS,
  PaletteKey,
} from '../constants/keys';
import { RotateCcw, Save, CheckCircle2, AlertCircle } from 'lucide-react';

interface KeyPaletteProps {
  activeLayer: 0 | 1;
  selectedKeyIndex: number | null;
  currentAssignment?: KeyAssignment;
  onAssignKey: (assignment: KeyAssignment) => void;
  onResetLayer: () => void;
  onSaveToKeyboard: () => void;
  isSaving: boolean;
  isConnected: boolean;
  statusMessage: string | null;
  statusType: 'info' | 'success' | 'error';
}

export const KeyPalette: React.FC<KeyPaletteProps> = ({
  activeLayer,
  selectedKeyIndex,
  currentAssignment,
  onAssignKey,
  onResetLayer,
  onSaveToKeyboard,
  isSaving,
  isConnected,
  statusMessage,
  statusType,
}) => {
  const [activeCategory, setActiveCategory] = useState<KeyCategory>('BASIC');
  const [modifierMask, setModifierMask] = useState<number>(0);

  const categories: { id: KeyCategory; label: string; count: number }[] = [
    {
      id: 'BASIC',
      label: 'BASIC',
      count: KEY_PALETTE.filter((k) => k.category === 'BASIC').length,
    },
    {
      id: 'MEDIA',
      label: 'MEDIA',
      count: KEY_PALETTE.filter((k) => k.category === 'MEDIA').length,
    },
    {
      id: 'SPECIAL',
      label: 'SPECIAL',
      count: KEY_PALETTE.filter((k) => k.category === 'SPECIAL').length,
    },
  ];

  const filteredKeys = KEY_PALETTE.filter((k) => k.category === activeCategory);
  const selectedPhysicalKey = GMK67_LAYOUT.find(
    (k) => k.keyIndex === selectedKeyIndex
  );

  const toggleModifierBit = (bit: number) => {
    setModifierMask((prev) => prev ^ bit);
  };

  const handlePaletteClick = (item: PaletteKey) => {
    if (selectedKeyIndex === null) return;

    if (item.actionCategory === 0x00) {
      onAssignKey({
        category: 0x00,
        modifiers: 0x00,
        hidCode: 0x00,
        label: selectedPhysicalKey?.label || 'Default',
        subLabel: selectedPhysicalKey?.subLabel,
      });
      return;
    }

    if (item.actionCategory === 0x05) {
      onAssignKey({
        category: 0x05,
        modifiers: 0x03,
        hidCode: 0x00,
        label: '🚫',
        subLabel: 'OFF',
      });
      return;
    }

    const activeModLabels = MODIFIER_BITS.filter(
      (m) => (modifierMask & m.bit) !== 0
    ).map((m) => m.short);

    const modPrefix =
      item.actionCategory === 0x02 && activeModLabels.length > 0
        ? activeModLabels.join('+')
        : undefined;

    onAssignKey({
      category: item.actionCategory,
      modifiers: item.actionCategory === 0x02 ? modifierMask : 0x00,
      hidCode: item.hidCode,
      label: item.label,
      subLabel: modPrefix || item.subLabel,
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#1b1b1e] border-t border-[#2c2c31] min-h-0 select-none">
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className="w-44 bg-[#161618] border-r border-[#2c2c31] py-3 flex flex-col justify-between shrink-0">
          <div className="space-y-0.5 px-2">
            <div className="px-2.5 pb-2 text-[10px] font-bold tracking-[0.16em] text-[#71717a] uppercase">
              KEYCODES
            </div>
            {categories.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full px-3 py-2 rounded text-left text-xs font-semibold tracking-[0.12em] flex items-center justify-between transition-colors ${
                    active
                      ? 'bg-[#2c2c31] text-[#e4e4e7] border-l-2 border-[#d89587]'
                      : 'text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#242427]/60'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className="text-[10px] font-mono text-[#71717a]">
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mx-2 p-2.5 rounded bg-[#141416] border border-[#27272c] space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717a]">
              Selected Key
            </div>
            {selectedPhysicalKey ? (
              <>
                <div className="text-xs font-semibold text-[#e4e4e7] flex items-center justify-between">
                  <span>{selectedPhysicalKey.label || 'Space'}</span>
                </div>
                <div className="text-[11px] text-[#a1a1aa] pt-0.5">
                  {currentAssignment && currentAssignment.category !== 0x00
                    ? `Assigned: ${currentAssignment.label}`
                    : 'Default'}
                </div>
              </>
            ) : (
              <div className="text-[11px] text-[#71717a]">
                Click a key above
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 bg-[#1b1b1e]">
          <div className="px-5 py-2 bg-[#18181b] border-b border-[#27272c] flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#71717a] mr-1">
                HOLD MODIFIERS:
              </span>
              {MODIFIER_BITS.map((mod) => {
                const active = (modifierMask & mod.bit) !== 0;
                return (
                  <button
                    key={mod.bit}
                    type="button"
                    onClick={() => toggleModifierBit(mod.bit)}
                    className={`h-6 px-2 rounded text-[11px] font-mono font-medium border transition-colors ${
                      active
                        ? 'bg-[#d89587] text-[#141416] border-[#d89587] font-semibold'
                        : 'bg-[#242427] text-[#a1a1aa] border-[#323238] hover:text-[#e4e4e7]'
                    }`}
                  >
                    {mod.label}
                  </button>
                );
              })}
              {modifierMask !== 0 && (
                <button
                  type="button"
                  onClick={() => setModifierMask(0)}
                  className="text-[11px] text-[#d89587] hover:underline ml-1"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="text-[11px] text-[#71717a]">
              {selectedKeyIndex !== null
                ? 'Click any keycap below to assign immediately'
                : 'Select a key on the keyboard canvas above first'}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <div className="flex flex-wrap gap-2">
              {filteredKeys.map((item) => {
                const wPx = (item.width || 1) * 46;
                const isCurrentlyAssigned =
                  currentAssignment &&
                  currentAssignment.category === item.actionCategory &&
                  currentAssignment.hidCode === item.hidCode &&
                  item.actionCategory !== 0x05;

                return (
                  <button
                    key={item.id}
                    type="button"
                    title={item.title}
                    onClick={() => handlePaletteClick(item)}
                    style={{
                      width: `${wPx}px`,
                      height: '46px',
                      background: isCurrentlyAssigned
                        ? 'linear-gradient(180deg, #d89587 0%, #bf7e70 100%)'
                        : 'linear-gradient(180deg, #303036 0%, #242429 100%)',
                      boxShadow:
                        '0 2px 0 #09090b, 0 3px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                    }}
                    className={`rounded-[5px] p-[3px] pb-[5px] transition-transform active:translate-y-[1px] hover:brightness-110 flex flex-col justify-between border ${
                      isCurrentlyAssigned
                        ? 'border-[#e4e4e7]'
                        : 'border-[#18181b] hover:border-[#52525b]'
                    }`}
                  >
                    <div
                      style={{
                        background: isCurrentlyAssigned
                          ? 'linear-gradient(180deg, #cf8c7e 0%, #d89587 100%)'
                          : 'linear-gradient(180deg, #28282e 0%, #2d2d34 100%)',
                      }}
                      className="w-full h-full rounded-[3px] px-1 py-0.5 flex flex-col items-center justify-center border-t border-white/[0.06]"
                    >
                      {item.subLabel && (
                        <span
                          className={`text-[9px] leading-none mb-0.5 ${
                            isCurrentlyAssigned
                              ? 'text-[#141416]/75'
                              : 'text-[#a1a1aa]'
                          }`}
                        >
                          {item.subLabel}
                        </span>
                      )}
                      <span
                        className={`text-[11px] font-semibold leading-none ${
                          isCurrentlyAssigned
                            ? 'text-[#141416]'
                            : 'text-[#e4e4e7]'
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="h-11 px-5 bg-[#141416] border-t border-[#2c2c31] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 text-xs">
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
              LAYER {activeLayer}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onResetLayer}
            className="h-7 px-3 rounded bg-[#242427] hover:bg-[#2c2c31] border border-[#34343a] text-[#a1a1aa] hover:text-[#e4e4e7] text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Layer {activeLayer}</span>
          </button>

          <button
            type="button"
            onClick={onSaveToKeyboard}
            disabled={isSaving}
            className="h-7 px-4 rounded bg-[#d89587] hover:bg-[#c48b7f] active:bg-[#b57d71] text-[#141416] text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>
              {isSaving ? 'Saving...' : 'Save to Keyboard'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

