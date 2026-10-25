export type KeyCategory = 'BASIC' | 'MEDIA' | 'SPECIAL';

export interface KeyAssignment {
  category: number; // 0x02 = Standard Key, 0x03 = Media, 0x05 = Default/Unmapped
  modifiers: number; // Bitmask for 0x02, or high-byte/param
  hidCode: number; // USB HID code
  label: string;
  subLabel?: string;
}

export interface PhysicalKey {
  id: string;
  keyIndex: number;
  lightIndex: number;
  label: string;
  subLabel?: string;
  defaultHid: number;
  fnDefaultLabel?: string;
  row: number;
  width: number;
  gapBefore?: number;
  isAccent?: boolean;
  isMod?: boolean;
  isKnob?: boolean;
  homing?: boolean;
  eventCode?: string;
}

export interface PaletteKey {
  id: string;
  label: string;
  subLabel?: string;
  title: string;
  category: KeyCategory;
  actionCategory: number;
  hidCode: number;
  modifiers?: number;
  width?: number;
}

export interface LightingModeInfo {
  id: number;
  hex: string;
  name: string;
  supportsSingleColor: boolean;
  supportsRainbow: boolean;
  supportsDirection: boolean;
}

export const GMK67_LAYOUT: PhysicalKey[] = [
  { id: 'esc', keyIndex: 1, lightIndex: 1, label: 'Esc', defaultHid: 0x29, fnDefaultLabel: '` ~', row: 0, width: 1, isAccent: true, eventCode: 'Escape' },
  { id: '1', keyIndex: 20, lightIndex: 20, label: '1', subLabel: '!', defaultHid: 0x1e, fnDefaultLabel: 'F1', row: 0, width: 1, eventCode: 'Digit1' },
  { id: '2', keyIndex: 21, lightIndex: 21, label: '2', subLabel: '@', defaultHid: 0x1f, fnDefaultLabel: 'F2', row: 0, width: 1, eventCode: 'Digit2' },
  { id: '3', keyIndex: 22, lightIndex: 22, label: '3', subLabel: '#', defaultHid: 0x20, fnDefaultLabel: 'F3', row: 0, width: 1, eventCode: 'Digit3' },
  { id: '4', keyIndex: 23, lightIndex: 23, label: '4', subLabel: '$', defaultHid: 0x21, fnDefaultLabel: 'F4', row: 0, width: 1, eventCode: 'Digit4' },
  { id: '5', keyIndex: 24, lightIndex: 24, label: '5', subLabel: '%', defaultHid: 0x22, fnDefaultLabel: 'F5', row: 0, width: 1, eventCode: 'Digit5' },
  { id: '6', keyIndex: 25, lightIndex: 25, label: '6', subLabel: '^', defaultHid: 0x23, fnDefaultLabel: 'F6', row: 0, width: 1, eventCode: 'Digit6' },
  { id: '7', keyIndex: 26, lightIndex: 26, label: '7', subLabel: '&', defaultHid: 0x24, fnDefaultLabel: 'F7', row: 0, width: 1, eventCode: 'Digit7' },
  { id: '8', keyIndex: 27, lightIndex: 27, label: '8', subLabel: '*', defaultHid: 0x25, fnDefaultLabel: 'F8', row: 0, width: 1, eventCode: 'Digit8' },
  { id: '9', keyIndex: 28, lightIndex: 28, label: '9', subLabel: '(', defaultHid: 0x26, fnDefaultLabel: 'F9', row: 0, width: 1, eventCode: 'Digit9' },
  { id: '0', keyIndex: 29, lightIndex: 29, label: '0', subLabel: ')', defaultHid: 0x27, fnDefaultLabel: 'F10', row: 0, width: 1, eventCode: 'Digit0' },
  { id: 'minus', keyIndex: 30, lightIndex: 30, label: '-', subLabel: '_', defaultHid: 0x2d, fnDefaultLabel: 'F11', row: 0, width: 1, eventCode: 'Minus' },
  { id: 'equal', keyIndex: 31, lightIndex: 31, label: '=', subLabel: '+', defaultHid: 0x2e, fnDefaultLabel: 'F12', row: 0, width: 1, eventCode: 'Equal' },
  { id: 'bspc', keyIndex: 103, lightIndex: 103, label: 'Backspace', defaultHid: 0x2a, row: 0, width: 2, isMod: true, eventCode: 'Backspace' },
  { id: 'knob', keyIndex: 104, lightIndex: 104, label: 'MUTE', subLabel: 'VOL', defaultHid: 0xe2, row: 0, width: 1, isKnob: true, eventCode: 'AudioVolumeMute' },

  { id: 'tab', keyIndex: 37, lightIndex: 37, label: 'Tab', defaultHid: 0x2b, row: 1, width: 1.5, isMod: true, eventCode: 'Tab' },
  { id: 'q', keyIndex: 38, lightIndex: 38, label: 'Q', defaultHid: 0x14, fnDefaultLabel: 'BT 1', row: 1, width: 1, eventCode: 'KeyQ' },
  { id: 'w', keyIndex: 39, lightIndex: 39, label: 'W', defaultHid: 0x1a, fnDefaultLabel: 'BT 2', row: 1, width: 1, eventCode: 'KeyW' },
  { id: 'e', keyIndex: 40, lightIndex: 40, label: 'E', defaultHid: 0x08, fnDefaultLabel: 'BT 3', row: 1, width: 1, eventCode: 'KeyE' },
  { id: 'r', keyIndex: 41, lightIndex: 41, label: 'R', defaultHid: 0x15, fnDefaultLabel: '2.4G', row: 1, width: 1, eventCode: 'KeyR' },
  { id: 't', keyIndex: 42, lightIndex: 42, label: 'T', defaultHid: 0x17, row: 1, width: 1, eventCode: 'KeyT' },
  { id: 'y', keyIndex: 43, lightIndex: 43, label: 'Y', defaultHid: 0x1c, row: 1, width: 1, eventCode: 'KeyY' },
  { id: 'u', keyIndex: 44, lightIndex: 44, label: 'U', defaultHid: 0x18, fnDefaultLabel: 'PrtSc', row: 1, width: 1, eventCode: 'KeyU' },
  { id: 'i', keyIndex: 45, lightIndex: 45, label: 'I', defaultHid: 0x0c, fnDefaultLabel: 'ScrLk', row: 1, width: 1, eventCode: 'KeyI' },
  { id: 'o', keyIndex: 46, lightIndex: 46, label: 'O', defaultHid: 0x12, fnDefaultLabel: 'Pause', row: 1, width: 1, eventCode: 'KeyO' },
  { id: 'p', keyIndex: 47, lightIndex: 47, label: 'P', defaultHid: 0x13, fnDefaultLabel: 'Ins', row: 1, width: 1, eventCode: 'KeyP' },
  { id: 'lbrack', keyIndex: 48, lightIndex: 48, label: '[', subLabel: '{', defaultHid: 0x2f, fnDefaultLabel: 'Home', row: 1, width: 1, eventCode: 'BracketLeft' },
  { id: 'rbrack', keyIndex: 49, lightIndex: 49, label: ']', subLabel: '}', defaultHid: 0x30, fnDefaultLabel: 'End', row: 1, width: 1, eventCode: 'BracketRight' },
  { id: 'bslash', keyIndex: 67, lightIndex: 67, label: '\\', subLabel: '|', defaultHid: 0x31, fnDefaultLabel: 'RGB Mode', row: 1, width: 1.5, isMod: true, eventCode: 'Backslash' },
  { id: 'del', keyIndex: 119, lightIndex: 119, label: 'Del', defaultHid: 0x4c, row: 1, width: 1, isMod: true, eventCode: 'Delete' },

  { id: 'caps', keyIndex: 55, lightIndex: 55, label: 'Caps Lock', defaultHid: 0x39, row: 2, width: 1.75, isMod: true, eventCode: 'CapsLock' },
  { id: 'a', keyIndex: 56, lightIndex: 56, label: 'A', defaultHid: 0x04, row: 2, width: 1, eventCode: 'KeyA' },
  { id: 's', keyIndex: 57, lightIndex: 57, label: 'S', defaultHid: 0x16, row: 2, width: 1, eventCode: 'KeyS' },
  { id: 'd', keyIndex: 58, lightIndex: 58, label: 'D', defaultHid: 0x07, row: 2, width: 1, eventCode: 'KeyD' },
  { id: 'f', keyIndex: 59, lightIndex: 59, label: 'F', defaultHid: 0x09, row: 2, width: 1, homing: true, eventCode: 'KeyF' },
  { id: 'g', keyIndex: 60, lightIndex: 60, label: 'G', defaultHid: 0x0a, row: 2, width: 1, eventCode: 'KeyG' },
  { id: 'h', keyIndex: 61, lightIndex: 61, label: 'H', defaultHid: 0x0b, row: 2, width: 1, eventCode: 'KeyH' },
  { id: 'j', keyIndex: 62, lightIndex: 62, label: 'J', defaultHid: 0x0d, row: 2, width: 1, homing: true, eventCode: 'KeyJ' },
  { id: 'k', keyIndex: 63, lightIndex: 63, label: 'K', defaultHid: 0x0e, row: 2, width: 1, eventCode: 'KeyK' },
  { id: 'l', keyIndex: 64, lightIndex: 64, label: 'L', defaultHid: 0x0f, row: 2, width: 1, eventCode: 'KeyL' },
  { id: 'scolon', keyIndex: 65, lightIndex: 65, label: ';', subLabel: ':', defaultHid: 0x33, row: 2, width: 1, eventCode: 'Semicolon' },
  { id: 'quote', keyIndex: 66, lightIndex: 66, label: "'", subLabel: '"', defaultHid: 0x34, row: 2, width: 1, eventCode: 'Quote' },
  { id: 'enter', keyIndex: 85, lightIndex: 85, label: 'Enter', defaultHid: 0x28, fnDefaultLabel: 'RGB Color', row: 2, width: 2.25, isAccent: true, eventCode: 'Enter' },
  { id: 'pgup', keyIndex: 118, lightIndex: 118, label: 'PgUp', defaultHid: 0x4b, row: 2, width: 1, isMod: true, eventCode: 'PageUp' },

  { id: 'lshift', keyIndex: 73, lightIndex: 73, label: 'Shift', defaultHid: 0xe1, row: 3, width: 2.25, isMod: true, eventCode: 'ShiftLeft' },
  { id: 'z', keyIndex: 74, lightIndex: 74, label: 'Z', defaultHid: 0x1d, row: 3, width: 1, eventCode: 'KeyZ' },
  { id: 'x', keyIndex: 75, lightIndex: 75, label: 'X', defaultHid: 0x1b, row: 3, width: 1, eventCode: 'KeyX' },
  { id: 'c', keyIndex: 76, lightIndex: 76, label: 'C', defaultHid: 0x06, row: 3, width: 1, eventCode: 'KeyC' },
  { id: 'v', keyIndex: 77, lightIndex: 77, label: 'V', defaultHid: 0x19, row: 3, width: 1, eventCode: 'KeyV' },
  { id: 'b', keyIndex: 78, lightIndex: 78, label: 'B', defaultHid: 0x05, row: 3, width: 1, eventCode: 'KeyB' },
  { id: 'n', keyIndex: 79, lightIndex: 79, label: 'N', defaultHid: 0x11, row: 3, width: 1, eventCode: 'KeyN' },
  { id: 'm', keyIndex: 80, lightIndex: 80, label: 'M', defaultHid: 0x10, row: 3, width: 1, eventCode: 'KeyM' },
  { id: 'comma', keyIndex: 81, lightIndex: 81, label: ',', subLabel: '<', defaultHid: 0x36, row: 3, width: 1, eventCode: 'Comma' },
  { id: 'dot', keyIndex: 82, lightIndex: 82, label: '.', subLabel: '>', defaultHid: 0x37, row: 3, width: 1, eventCode: 'Period' },
  { id: 'slash', keyIndex: 83, lightIndex: 83, label: '/', subLabel: '?', defaultHid: 0x38, row: 3, width: 1, eventCode: 'Slash' },
  { id: 'rshift', keyIndex: 84, lightIndex: 84, label: 'Shift', defaultHid: 0xe5, row: 3, width: 1.75, isMod: true, eventCode: 'ShiftRight' },
  { id: 'up', keyIndex: 101, lightIndex: 101, label: '↑', defaultHid: 0x52, fnDefaultLabel: 'BRT +', row: 3, width: 1, isAccent: true, eventCode: 'ArrowUp' },
  { id: 'pgdn', keyIndex: 121, lightIndex: 121, label: 'PgDn', defaultHid: 0x4e, row: 3, width: 1, isMod: true, eventCode: 'PageDown' },

  { id: 'lctrl', keyIndex: 91, lightIndex: 91, label: 'Ctrl', defaultHid: 0xe0, row: 4, width: 1.25, isMod: true, eventCode: 'ControlLeft' },
  { id: 'lwin', keyIndex: 92, lightIndex: 92, label: 'Win', defaultHid: 0xe3, fnDefaultLabel: 'Win Lock', row: 4, width: 1.25, isMod: true, eventCode: 'MetaLeft' },
  { id: 'lalt', keyIndex: 93, lightIndex: 93, label: 'Alt', defaultHid: 0xe2, row: 4, width: 1.25, isMod: true, eventCode: 'AltLeft' },
  { id: 'space', keyIndex: 94, lightIndex: 94, label: '', defaultHid: 0x2c, fnDefaultLabel: 'Reset', row: 4, width: 6.25, eventCode: 'Space' },
  { id: 'ralt', keyIndex: 95, lightIndex: 95, label: 'Alt', defaultHid: 0xe6, row: 4, width: 1.25, isMod: true, eventCode: 'AltRight' },
  { id: 'fn', keyIndex: 96, lightIndex: 96, label: 'Fn', defaultHid: 0xaf, row: 4, width: 1.25, isMod: true, eventCode: 'ContextMenu' },
  { id: 'left', keyIndex: 99, lightIndex: 99, label: '←', defaultHid: 0x50, fnDefaultLabel: 'SPD -', row: 4, width: 1, gapBefore: 0.5, isAccent: true, eventCode: 'ArrowLeft' },
  { id: 'down', keyIndex: 100, lightIndex: 100, label: '↓', defaultHid: 0x51, fnDefaultLabel: 'BRT -', row: 4, width: 1, isAccent: true, eventCode: 'ArrowDown' },
  { id: 'right', keyIndex: 102, lightIndex: 102, label: '→', defaultHid: 0x4f, fnDefaultLabel: 'SPD +', row: 4, width: 1, isAccent: true, eventCode: 'ArrowRight' },
];

export const HID_CODE_TO_EVENT_CODE: Record<number, string> = {
  0x04: 'KeyA',
  0x05: 'KeyB',
  0x06: 'KeyC',
  0x07: 'KeyD',
  0x08: 'KeyE',
  0x09: 'KeyF',
  0x0a: 'KeyG',
  0x0b: 'KeyH',
  0x0c: 'KeyI',
  0x0d: 'KeyJ',
  0x0e: 'KeyK',
  0x0f: 'KeyL',
  0x10: 'KeyM',
  0x11: 'KeyN',
  0x12: 'KeyO',
  0x13: 'KeyP',
  0x14: 'KeyQ',
  0x15: 'KeyR',
  0x16: 'KeyS',
  0x17: 'KeyT',
  0x18: 'KeyU',
  0x19: 'KeyV',
  0x1a: 'KeyW',
  0x1b: 'KeyX',
  0x1c: 'KeyY',
  0x1d: 'KeyZ',
  0x1e: 'Digit1',
  0x1f: 'Digit2',
  0x20: 'Digit3',
  0x21: 'Digit4',
  0x22: 'Digit5',
  0x23: 'Digit6',
  0x24: 'Digit7',
  0x25: 'Digit8',
  0x26: 'Digit9',
  0x27: 'Digit0',
  0x28: 'Enter',
  0x29: 'Escape',
  0x2a: 'Backspace',
  0x2b: 'Tab',
  0x2c: 'Space',
  0x2d: 'Minus',
  0x2e: 'Equal',
  0x2f: 'BracketLeft',
  0x30: 'BracketRight',
  0x31: 'Backslash',
  0x33: 'Semicolon',
  0x34: 'Quote',
  0x35: 'Backquote',
  0x36: 'Comma',
  0x37: 'Period',
  0x38: 'Slash',
  0x39: 'CapsLock',
  0x3a: 'F1',
  0x3b: 'F2',
  0x3c: 'F3',
  0x3d: 'F4',
  0x3e: 'F5',
  0x3f: 'F6',
  0x40: 'F7',
  0x41: 'F8',
  0x42: 'F9',
  0x43: 'F10',
  0x44: 'F11',
  0x45: 'F12',
  0x46: 'PrintScreen',
  0x47: 'ScrollLock',
  0x48: 'Pause',
  0x49: 'Insert',
  0x4a: 'Home',
  0x4b: 'PageUp',
  0x4c: 'Delete',
  0x4d: 'End',
  0x4e: 'PageDown',
  0x4f: 'ArrowRight',
  0x50: 'ArrowLeft',
  0x51: 'ArrowDown',
  0x52: 'ArrowUp',
  0xe0: 'ControlLeft',
  0xe1: 'ShiftLeft',
  0xe2: 'AltLeft',
  0xe3: 'MetaLeft',
  0xe4: 'ControlRight',
  0xe5: 'ShiftRight',
  0xe6: 'AltRight',
  0xe7: 'MetaRight',
};

export const KEY_PALETTE: PaletteKey[] = [
  { id: 'kc_a', label: 'A', title: 'Key A', category: 'BASIC', actionCategory: 0x02, hidCode: 0x04 },
  { id: 'kc_b', label: 'B', title: 'Key B', category: 'BASIC', actionCategory: 0x02, hidCode: 0x05 },
  { id: 'kc_c', label: 'C', title: 'Key C', category: 'BASIC', actionCategory: 0x02, hidCode: 0x06 },
  { id: 'kc_d', label: 'D', title: 'Key D', category: 'BASIC', actionCategory: 0x02, hidCode: 0x07 },
  { id: 'kc_e', label: 'E', title: 'Key E', category: 'BASIC', actionCategory: 0x02, hidCode: 0x08 },
  { id: 'kc_f', label: 'F', title: 'Key F', category: 'BASIC', actionCategory: 0x02, hidCode: 0x09 },
  { id: 'kc_g', label: 'G', title: 'Key G', category: 'BASIC', actionCategory: 0x02, hidCode: 0x0a },
  { id: 'kc_h', label: 'H', title: 'Key H', category: 'BASIC', actionCategory: 0x02, hidCode: 0x0b },
  { id: 'kc_i', label: 'I', title: 'Key I', category: 'BASIC', actionCategory: 0x02, hidCode: 0x0c },
  { id: 'kc_j', label: 'J', title: 'Key J', category: 'BASIC', actionCategory: 0x02, hidCode: 0x0d },
  { id: 'kc_k', label: 'K', title: 'Key K', category: 'BASIC', actionCategory: 0x02, hidCode: 0x0e },
  { id: 'kc_l', label: 'L', title: 'Key L', category: 'BASIC', actionCategory: 0x02, hidCode: 0x0f },
  { id: 'kc_m', label: 'M', title: 'Key M', category: 'BASIC', actionCategory: 0x02, hidCode: 0x10 },
  { id: 'kc_n', label: 'N', title: 'Key N', category: 'BASIC', actionCategory: 0x02, hidCode: 0x11 },
  { id: 'kc_o', label: 'O', title: 'Key O', category: 'BASIC', actionCategory: 0x02, hidCode: 0x12 },
  { id: 'kc_p', label: 'P', title: 'Key P', category: 'BASIC', actionCategory: 0x02, hidCode: 0x13 },
  { id: 'kc_q', label: 'Q', title: 'Key Q', category: 'BASIC', actionCategory: 0x02, hidCode: 0x14 },
  { id: 'kc_r', label: 'R', title: 'Key R', category: 'BASIC', actionCategory: 0x02, hidCode: 0x15 },
  { id: 'kc_s', label: 'S', title: 'Key S', category: 'BASIC', actionCategory: 0x02, hidCode: 0x16 },
  { id: 'kc_t', label: 'T', title: 'Key T', category: 'BASIC', actionCategory: 0x02, hidCode: 0x17 },
  { id: 'kc_u', label: 'U', title: 'Key U', category: 'BASIC', actionCategory: 0x02, hidCode: 0x18 },
  { id: 'kc_v', label: 'V', title: 'Key V', category: 'BASIC', actionCategory: 0x02, hidCode: 0x19 },
  { id: 'kc_w', label: 'W', title: 'Key W', category: 'BASIC', actionCategory: 0x02, hidCode: 0x1a },
  { id: 'kc_x', label: 'X', title: 'Key X', category: 'BASIC', actionCategory: 0x02, hidCode: 0x1b },
  { id: 'kc_y', label: 'Y', title: 'Key Y', category: 'BASIC', actionCategory: 0x02, hidCode: 0x1c },
  { id: 'kc_z', label: 'Z', title: 'Key Z', category: 'BASIC', actionCategory: 0x02, hidCode: 0x1d },

  { id: 'kc_1', label: '1', subLabel: '!', title: '1 / !', category: 'BASIC', actionCategory: 0x02, hidCode: 0x1e },
  { id: 'kc_2', label: '2', subLabel: '@', title: '2 / @', category: 'BASIC', actionCategory: 0x02, hidCode: 0x1f },
  { id: 'kc_3', label: '3', subLabel: '#', title: '3 / #', category: 'BASIC', actionCategory: 0x02, hidCode: 0x20 },
  { id: 'kc_4', label: '4', subLabel: '$', title: '4 / $', category: 'BASIC', actionCategory: 0x02, hidCode: 0x21 },
  { id: 'kc_5', label: '5', subLabel: '%', title: '5 / %', category: 'BASIC', actionCategory: 0x02, hidCode: 0x22 },
  { id: 'kc_6', label: '6', subLabel: '^', title: '6 / ^', category: 'BASIC', actionCategory: 0x02, hidCode: 0x23 },
  { id: 'kc_7', label: '7', subLabel: '&', title: '7 / &', category: 'BASIC', actionCategory: 0x02, hidCode: 0x24 },
  { id: 'kc_8', label: '8', subLabel: '*', title: '8 / *', category: 'BASIC', actionCategory: 0x02, hidCode: 0x25 },
  { id: 'kc_9', label: '9', subLabel: '(', title: '9 / (', category: 'BASIC', actionCategory: 0x02, hidCode: 0x26 },
  { id: 'kc_0', label: '0', subLabel: ')', title: '0 / )', category: 'BASIC', actionCategory: 0x02, hidCode: 0x27 },

  { id: 'kc_esc', label: 'Esc', title: 'Escape', category: 'BASIC', actionCategory: 0x02, hidCode: 0x29 },
  { id: 'kc_tab', label: 'Tab', title: 'Tab', category: 'BASIC', actionCategory: 0x02, hidCode: 0x2b, width: 1.25 },
  { id: 'kc_caps', label: 'Caps', title: 'Caps Lock', category: 'BASIC', actionCategory: 0x02, hidCode: 0x39, width: 1.25 },
  { id: 'kc_spc', label: 'Space', title: 'Spacebar', category: 'BASIC', actionCategory: 0x02, hidCode: 0x2c, width: 1.5 },
  { id: 'kc_ent', label: 'Enter', title: 'Return / Enter', category: 'BASIC', actionCategory: 0x02, hidCode: 0x28, width: 1.5 },
  { id: 'kc_bspc', label: 'Bksp', title: 'Backspace', category: 'BASIC', actionCategory: 0x02, hidCode: 0x2a, width: 1.5 },
  { id: 'kc_grv', label: '`', subLabel: '~', title: 'Grave / Tilde', category: 'BASIC', actionCategory: 0x02, hidCode: 0x35 },
  { id: 'kc_min', label: '-', subLabel: '_', title: 'Minus / Underscore', category: 'BASIC', actionCategory: 0x02, hidCode: 0x2d },
  { id: 'kc_eql', label: '=', subLabel: '+', title: 'Equal / Plus', category: 'BASIC', actionCategory: 0x02, hidCode: 0x2e },
  { id: 'kc_lbrc', label: '[', subLabel: '{', title: 'Left Bracket', category: 'BASIC', actionCategory: 0x02, hidCode: 0x2f },
  { id: 'kc_rbrc', label: ']', subLabel: '}', title: 'Right Bracket', category: 'BASIC', actionCategory: 0x02, hidCode: 0x30 },
  { id: 'kc_bsls', label: '\\', subLabel: '|', title: 'Backslash / Pipe', category: 'BASIC', actionCategory: 0x02, hidCode: 0x31 },
  { id: 'kc_scln', label: ';', subLabel: ':', title: 'Semicolon / Colon', category: 'BASIC', actionCategory: 0x02, hidCode: 0x33 },
  { id: 'kc_quot', label: "'", subLabel: '"', title: 'Quote', category: 'BASIC', actionCategory: 0x02, hidCode: 0x34 },
  { id: 'kc_comm', label: ',', subLabel: '<', title: 'Comma', category: 'BASIC', actionCategory: 0x02, hidCode: 0x36 },
  { id: 'kc_dot', label: '.', subLabel: '>', title: 'Period', category: 'BASIC', actionCategory: 0x02, hidCode: 0x37 },
  { id: 'kc_slsh', label: '/', subLabel: '?', title: 'Slash / Question', category: 'BASIC', actionCategory: 0x02, hidCode: 0x38 },

  { id: 'kc_up', label: '↑', title: 'Up Arrow', category: 'BASIC', actionCategory: 0x02, hidCode: 0x52 },
  { id: 'kc_down', label: '↓', title: 'Down Arrow', category: 'BASIC', actionCategory: 0x02, hidCode: 0x51 },
  { id: 'kc_left', label: '←', title: 'Left Arrow', category: 'BASIC', actionCategory: 0x02, hidCode: 0x50 },
  { id: 'kc_right', label: '→', title: 'Right Arrow', category: 'BASIC', actionCategory: 0x02, hidCode: 0x4f },

  { id: 'kc_lctl', label: 'LCtrl', title: 'Left Control', category: 'BASIC', actionCategory: 0x02, hidCode: 0xe0, width: 1.25 },
  { id: 'kc_lsft', label: 'LShift', title: 'Left Shift', category: 'BASIC', actionCategory: 0x02, hidCode: 0xe1, width: 1.25 },
  { id: 'kc_lalt', label: 'LAlt', title: 'Left Alt', category: 'BASIC', actionCategory: 0x02, hidCode: 0xe2, width: 1.25 },
  { id: 'kc_lgui', label: 'LWin', title: 'Left Win / Command', category: 'BASIC', actionCategory: 0x02, hidCode: 0xe3, width: 1.25 },
  { id: 'kc_rctl', label: 'RCtrl', title: 'Right Control', category: 'BASIC', actionCategory: 0x02, hidCode: 0xe4, width: 1.25 },
  { id: 'kc_rsft', label: 'RShift', title: 'Right Shift', category: 'BASIC', actionCategory: 0x02, hidCode: 0xe5, width: 1.25 },
  { id: 'kc_ralt', label: 'RAlt', title: 'Right Alt', category: 'BASIC', actionCategory: 0x02, hidCode: 0xe6, width: 1.25 },
  { id: 'kc_rgui', label: 'RWin', title: 'Right Win / Command', category: 'BASIC', actionCategory: 0x02, hidCode: 0xe7, width: 1.25 },

  { id: 'kc_volu', label: 'Vol +', subLabel: '🔊', title: 'Volume Up', category: 'MEDIA', actionCategory: 0x03, hidCode: 0xe9, width: 1.5 },
  { id: 'kc_vold', label: 'Vol -', subLabel: '🔉', title: 'Volume Down', category: 'MEDIA', actionCategory: 0x03, hidCode: 0xea, width: 1.5 },
  { id: 'kc_mute', label: 'Mute', subLabel: '🔇', title: 'Audio Mute', category: 'MEDIA', actionCategory: 0x03, hidCode: 0xe2, width: 1.5 },
  { id: 'kc_mnxt', label: 'Next', subLabel: '⏭', title: 'Next Track', category: 'MEDIA', actionCategory: 0x03, hidCode: 0xb5, width: 1.5 },
  { id: 'kc_mprv', label: 'Prev', subLabel: '⏮', title: 'Previous Track', category: 'MEDIA', actionCategory: 0x03, hidCode: 0xb6, width: 1.5 },
  { id: 'kc_mstp', label: 'Stop', subLabel: '⏹', title: 'Stop Playback', category: 'MEDIA', actionCategory: 0x03, hidCode: 0xb7, width: 1.5 },
  { id: 'kc_mply', label: 'Play', subLabel: '⏯', title: 'Play / Pause', category: 'MEDIA', actionCategory: 0x03, hidCode: 0xcd, width: 1.5 },

  { id: 'kc_default', label: 'Default', subLabel: '▽', title: 'Restore Default Key', category: 'SPECIAL', actionCategory: 0x00, hidCode: 0x00, width: 1.5 },
  { id: 'kc_disable', label: 'Disable', subLabel: '✕', title: 'Disable Key', category: 'SPECIAL', actionCategory: 0x05, hidCode: 0x00, width: 1.5 },
  { id: 'kc_pscr', label: 'PrtSc', title: 'Print Screen', category: 'SPECIAL', actionCategory: 0x02, hidCode: 0x46, width: 1.25 },
  { id: 'kc_slck', label: 'ScrLk', title: 'Scroll Lock', category: 'SPECIAL', actionCategory: 0x02, hidCode: 0x47, width: 1.25 },
  { id: 'kc_paus', label: 'Pause', title: 'Pause / Break', category: 'SPECIAL', actionCategory: 0x02, hidCode: 0x48, width: 1.25 },
  { id: 'kc_ins', label: 'Ins', title: 'Insert', category: 'SPECIAL', actionCategory: 0x02, hidCode: 0x49, width: 1.25 },
  { id: 'kc_home', label: 'Home', title: 'Home', category: 'SPECIAL', actionCategory: 0x02, hidCode: 0x4a, width: 1.25 },
  { id: 'kc_pgup', label: 'PgUp', title: 'Page Up', category: 'SPECIAL', actionCategory: 0x02, hidCode: 0x4b, width: 1.25 },
  { id: 'kc_del', label: 'Del', title: 'Delete', category: 'SPECIAL', actionCategory: 0x02, hidCode: 0x4c, width: 1.25 },
  { id: 'kc_end', label: 'End', title: 'End', category: 'SPECIAL', actionCategory: 0x02, hidCode: 0x4d, width: 1.25 },
  { id: 'kc_pgdn', label: 'PgDn', title: 'Page Down', category: 'SPECIAL', actionCategory: 0x02, hidCode: 0x4e, width: 1.25 },
  { id: 'kc_f1', label: 'F1', title: 'F1', category: 'SPECIAL', actionCategory: 0x02, hidCode: 0x3a },
  { id: 'kc_f2', label: 'F2', title: 'F2', category: 'SPECIAL', actionCategory: 0x02, hidCode: 0x3b },
  { id: 'kc_f3', label: 'F3', title: 'F3', category: 'SPECIAL', actionCategory: 0x02, hidCode: 0x3c },
  { id: 'kc_f4', label: 'F4', title: 'F4', category: 'SPECIAL', actionCategory: 0x02, hidCode: 0x3d },
  { id: 'kc_f5', label: 'F5', title: 'F5', category: 'SPECIAL', actionCategory: 0x02, hidCode: 0x3e },
  { id: 'kc_f6', label: 'F6', title: 'F6', category: 'SPECIAL', actionCategory: 0x02, hidCode: 0x3f },
  { id: 'kc_f7', label: 'F7', title: 'F7', category: 'SPECIAL', actionCategory: 0x02, hidCode: 0x40 },
  { id: 'kc_f8', label: 'F8', title: 'F8', category: 'SPECIAL', actionCategory: 0x02, hidCode: 0x41 },
  { id: 'kc_f9', label: 'F9', title: 'F9', category: 'SPECIAL', actionCategory: 0x02, hidCode: 0x42 },
  { id: 'kc_f10', label: 'F10', title: 'F10', category: 'SPECIAL', actionCategory: 0x02, hidCode: 0x43 },
  { id: 'kc_f11', label: 'F11', title: 'F11', category: 'SPECIAL', actionCategory: 0x02, hidCode: 0x44 },
  { id: 'kc_f12', label: 'F12', title: 'F12', category: 'SPECIAL', actionCategory: 0x02, hidCode: 0x45 },
];

export const LIGHTING_MODES: LightingModeInfo[] = [
  { id: 1, hex: '0x01', name: 'Static (Always On)', supportsSingleColor: true, supportsRainbow: true, supportsDirection: false },
  { id: 2, hex: '0x02', name: 'Single On (Key Reactive)', supportsSingleColor: true, supportsRainbow: true, supportsDirection: false },
  { id: 3, hex: '0x03', name: 'Single Off (Key Fade)', supportsSingleColor: true, supportsRainbow: true, supportsDirection: false },
  { id: 4, hex: '0x04', name: 'Glittering (Stars)', supportsSingleColor: true, supportsRainbow: true, supportsDirection: false },
  { id: 5, hex: '0x05', name: 'Falling (Snow)', supportsSingleColor: true, supportsRainbow: true, supportsDirection: false },
  { id: 6, hex: '0x06', name: 'Colourful', supportsSingleColor: false, supportsRainbow: true, supportsDirection: false },
  { id: 7, hex: '0x07', name: 'Breath', supportsSingleColor: true, supportsRainbow: true, supportsDirection: false },
  { id: 8, hex: '0x08', name: 'Spectrum Cycle', supportsSingleColor: false, supportsRainbow: true, supportsDirection: false },
  { id: 9, hex: '0x09', name: 'Outward (Spring)', supportsSingleColor: true, supportsRainbow: true, supportsDirection: false },
  { id: 10, hex: '0x0A', name: 'Scrolling', supportsSingleColor: true, supportsRainbow: true, supportsDirection: true },
  { id: 11, hex: '0x0B', name: 'Rolling (Wave)', supportsSingleColor: true, supportsRainbow: true, supportsDirection: true },
  { id: 12, hex: '0x0C', name: 'Rotating (Windmill)', supportsSingleColor: true, supportsRainbow: true, supportsDirection: false },
  { id: 13, hex: '0x0D', name: 'Explode', supportsSingleColor: true, supportsRainbow: true, supportsDirection: false },
  { id: 14, hex: '0x0E', name: 'Launch', supportsSingleColor: true, supportsRainbow: true, supportsDirection: false },
  { id: 15, hex: '0x0F', name: 'Ripples', supportsSingleColor: true, supportsRainbow: true, supportsDirection: false },
  { id: 16, hex: '0x10', name: 'Flowing', supportsSingleColor: true, supportsRainbow: true, supportsDirection: true },
  { id: 17, hex: '0x11', name: 'Pulsating', supportsSingleColor: true, supportsRainbow: true, supportsDirection: false },
  { id: 18, hex: '0x12', name: 'Tilt', supportsSingleColor: true, supportsRainbow: true, supportsDirection: true },
  { id: 19, hex: '0x13', name: 'Shuttle', supportsSingleColor: true, supportsRainbow: true, supportsDirection: false },
  { id: 20, hex: '0x14', name: 'LED Off (Backlight Off)', supportsSingleColor: false, supportsRainbow: false, supportsDirection: false },
];

export const MODIFIER_BITS = [
  { bit: 0x01, label: 'LCtrl', short: 'C' },
  { bit: 0x02, label: 'LShift', short: 'S' },
  { bit: 0x04, label: 'LAlt', short: 'A' },
  { bit: 0x08, label: 'LWin', short: 'G' },
  { bit: 0x10, label: 'RCtrl', short: 'RC' },
  { bit: 0x20, label: 'RShift', short: 'RS' },
  { bit: 0x40, label: 'RAlt', short: 'RA' },
  { bit: 0x80, label: 'RWin', short: 'RG' },
];

