import { invoke } from '@tauri-apps/api/core';
import { GMK67_LAYOUT, KeyAssignment } from '../constants/keys';

export const GMK67_VID = 0x05ac;
export const GMK67_PID = 0x024f;

export interface PacketLogEntry {
  id: string;
  timestamp: string;
  description: string;
  bytes: Uint8Array;
  ackHex?: string;
}

interface QueuedPacket {
  bytes: Uint8Array;
  description: string;
  expectAck: boolean;
  delayMs: number;
}

interface NativeBridgeStatus {
  connected: boolean;
  dongleOnly?: boolean;
  deviceNode?: string | null;
  hasFeatureReport?: boolean;
  writable?: boolean;
  error?: string | null;
}

interface NativeExecResult {
  ok: boolean;
  deviceNode?: string | null;
  replies?: (number[] | null)[];
  error?: string | null;
}

function isTauriApp(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export class GMK67Driver {
  private device: HIDDevice | null;
  private bridgeDeviceNode: string | null;
  private onPacketLog?: (entry: PacketLogEntry) => void;

  constructor(
    device: HIDDevice | null,
    bridgeDeviceNode: string | null,
    onPacketLog?: (entry: PacketLogEntry) => void
  ) {
    this.device = device;
    this.bridgeDeviceNode = bridgeDeviceNode;
    this.onPacketLog = onPacketLog;
  }

  public getDevice(): HIDDevice | null {
    return this.device;
  }

  public getDeviceLabel(): string {
    if (this.bridgeDeviceNode) {
      return `ZUOYA GMK67 (${this.bridgeDeviceNode})`;
    }
    return this.device?.productName || 'ZUOYA GMK67';
  }

  private static async checkNativeBridge(): Promise<NativeBridgeStatus | null> {
    if (isTauriApp()) {
      try {
        return await invoke<NativeBridgeStatus>('gmk67_status');
      } catch (err: unknown) {
        return {
          connected: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    }

    try {
      const res = await fetch('/api/gmk67/status');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public static async connect(
    onPacketLog?: (entry: PacketLogEntry) => void
  ): Promise<GMK67Driver> {
    let bridgeStatus = await GMK67Driver.checkNativeBridge();
    if (bridgeStatus) {
      if (bridgeStatus.connected && bridgeStatus.deviceNode) {
        return new GMK67Driver(null, bridgeStatus.deviceNode, onPacketLog);
      }

      if (
        isTauriApp() &&
        bridgeStatus.hasFeatureReport &&
        bridgeStatus.writable === false
      ) {
        await invoke('gmk67_setup_udev');
        bridgeStatus = await GMK67Driver.checkNativeBridge();
        if (bridgeStatus && bridgeStatus.connected && bridgeStatus.deviceNode) {
          return new GMK67Driver(null, bridgeStatus.deviceNode, onPacketLog);
        }
      }

      if (bridgeStatus?.error) {
        throw new Error(bridgeStatus.error);
      }
    }

    if (!('hid' in navigator)) {
      throw new Error(
        bridgeStatus?.error ||
          'GMK67 (05AC:024F) not detected in Wired USB mode.'
      );
    }

    const devices = await navigator.hid.requestDevice({
      filters: [{ vendorId: GMK67_VID, productId: GMK67_PID }],
    });

    if (!devices || devices.length === 0) {
      throw new Error(bridgeStatus?.error || 'No GMK67 device selected.');
    }

    const featureDevice =
      devices.find((d) =>
        d.collections.some(
          (c) => c.featureReports && c.featureReports.length > 0
        )
      ) || devices[0];

    if (!featureDevice.opened) {
      await featureDevice.open();
    }

    return new GMK67Driver(featureDevice, null, onPacketLog);
  }

  public static async tryAutoConnect(
    onPacketLog?: (entry: PacketLogEntry) => void,
    onPermissionNeeded?: (errorMsg: string) => void
  ): Promise<GMK67Driver | null> {
    const bridgeStatus = await GMK67Driver.checkNativeBridge();
    if (bridgeStatus) {
      if (bridgeStatus.connected && bridgeStatus.deviceNode) {
        return new GMK67Driver(null, bridgeStatus.deviceNode, onPacketLog);
      }
      if (bridgeStatus.hasFeatureReport && !bridgeStatus.writable && bridgeStatus.error) {
        onPermissionNeeded?.(bridgeStatus.error);
      }
    }
    return null;
  }

  public async disconnect(): Promise<void> {
    if (this.device && this.device.opened) {
      await this.device.close();
    }
    this.device = null;
    this.bridgeDeviceNode = null;
  }

  private logPacket(
    payload: Uint8Array,
    description: string,
    ackBytes?: number[] | null
  ): void {
    if (!this.onPacketLog) return;
    const now = new Date();
    const timeStr = `${now.toTimeString().split(' ')[0]}.${String(
      now.getMilliseconds()
    ).padStart(3, '0')}`;
    const ackHex =
      ackBytes && ackBytes.length >= 4
        ? ackBytes
            .slice(0, 8)
            .map((b) => b.toString(16).toUpperCase().padStart(2, '0'))
            .join(' ')
        : undefined;

    this.onPacketLog({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: timeStr,
      description: ackHex ? `${description} [ACK: ${ackHex}]` : description,
      bytes: new Uint8Array(payload),
      ackHex,
    });
  }

  /**
   * Executes a sequence of 64-byte HID Feature Reports (Report ID 0x00)
   * with optional GET_FEATURE ACK handshakes (matching `sub_449b80` in DeviceDriver.exe).
   */
  private async executeSequence(sequence: QueuedPacket[]): Promise<void> {
    if (this.bridgeDeviceNode) {
      let data: NativeExecResult;

      if (isTauriApp()) {
        data = await invoke<NativeExecResult>('gmk67_exec', {
          packets: sequence.map((p) => ({
            bytes: Array.from(p.bytes),
            expectAck: p.expectAck,
            delayMs: p.delayMs,
          })),
        });
      } else {
        const res = await fetch('/api/gmk67/exec', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            packets: sequence.map((p) => ({
              bytes: Array.from(p.bytes),
              expectAck: p.expectAck,
              delayMs: p.delayMs,
            })),
          }),
        });
        data = await res.json();
      }

      if (!data.ok) {
        throw new Error(
          data.error || 'Failed to write to GMK67 hidraw device'
        );
      }

      const replies: (number[] | null)[] = data.replies || [];
      sequence.forEach((pkt, idx) => {
        this.logPacket(pkt.bytes, pkt.description, replies[idx]);
      });
      return;
    }

    if (!this.device) {
      throw new Error('Keyboard is not connected.');
    }

    for (const pkt of sequence) {
      if (pkt.bytes.length !== 64) {
        throw new Error(`Payload must be 64 bytes (got ${pkt.bytes.length})`);
      }
      await this.device.sendFeatureReport(
        0x00,
        pkt.bytes as unknown as BufferSource
      );
      await new Promise((resolve) => setTimeout(resolve, pkt.delayMs));

      let ackArr: number[] | null = null;
      if (pkt.expectAck) {
        try {
          const view = await this.device.receiveFeatureReport(0x00);
          const u8 = new Uint8Array(
            view.buffer,
            view.byteOffset,
            view.byteLength
          );
          const slice = u8.length === 65 ? u8.subarray(1) : u8;
          ackArr = Array.from(slice);
        } catch {
        }
      }
      this.logPacket(pkt.bytes, pkt.description, ackArr);
    }
  }

  private createCommandFrame(opCode: number): Uint8Array {
    const frame = new Uint8Array(64);
    frame[0] = 0x04;
    frame[1] = opCode & 0xff;
    return frame;
  }

  public async writeLayerKeymap(
    layer: 0 | 1,
    assignments: Record<number, KeyAssignment>
  ): Promise<void> {
    const opCode = layer === 0 ? 0x11 : 0x27;
    const sequence: QueuedPacket[] = [];

    sequence.push({
      bytes: this.createCommandFrame(0x18),
      description: 'CMD_CONFIG_BEGIN (0x18)',
      expectAck: true,
      delayMs: 15,
    });

    const initCmd = this.createCommandFrame(opCode);
    initCmd[8] = 0x09;
    sequence.push({
      bytes: initCmd,
      description: `CMD_REMAP_LAYER_${layer} (0x${opCode
        .toString(16)
        .toUpperCase()}) Init [9 chunks]`,
      expectAck: true,
      delayMs: 15,
    });

    const buffer = new Uint8Array(9 * 64);

    for (const key of GMK67_LAYOUT) {
      if (key.isKnob) continue;
      const custom = assignments[key.keyIndex];
      if (!custom || custom.category === 0x00) continue;

      const offset = key.keyIndex * 4;
      if (offset + 3 < buffer.length - 2) {
        if (custom.category === 0x05) {
          // Disable Key (KC_NO -> [0x05, 0x03, 0x00, 0x00])
          buffer[offset] = 0x05;
          buffer[offset + 1] = 0x03;
          buffer[offset + 2] = 0x00;
          buffer[offset + 3] = 0x00;
        } else if (custom.category === 0x03) {
          // Multimedia Key: [0x03, consumerCode, 0x00, 0x00] (matches edx_1 == 6 in sub_4143f0)
          buffer[offset] = 0x03;
          buffer[offset + 1] = custom.hidCode & 0xff;
          buffer[offset + 2] = 0x00;
          buffer[offset + 3] = 0x00;
        } else if (
          custom.category === 0x02 &&
          custom.hidCode >= 0xe0 &&
          custom.hidCode <= 0xe7
        ) {
          // Modifier Key (0xE0..0xE7): sub_44c830 converts 0xE0..0xE7 to bitmask at offset + 1
          const modBit = 1 << (custom.hidCode - 0xe0);
          buffer[offset] = 0x02;
          buffer[offset + 1] = ((custom.modifiers ?? 0) | modBit) & 0xff;
          buffer[offset + 2] = 0x00;
          buffer[offset + 3] = 0x00;
        } else {
          // Standard Key: [0x02, modifierMask, hidCode, 0x00]
          buffer[offset] = custom.category & 0xff;
          buffer[offset + 1] = (custom.modifiers ?? 0) & 0xff;
          buffer[offset + 2] = custom.hidCode & 0xff;
          buffer[offset + 3] = 0x00;
        }
      }
    }

    buffer[574] = 0xaa;
    buffer[575] = 0x55;

    for (let i = 0; i < 9; i++) {
      const chunk = buffer.slice(i * 64, (i + 1) * 64);
      sequence.push({
        bytes: chunk,
        description: `Layer ${layer} Matrix Chunk ${i + 1}/9`,
        expectAck: false,
        delayMs: 15,
      });
    }

    sequence.push({
      bytes: this.createCommandFrame(0x02),
      description: 'CMD_SAVE_EEPROM (0x02)',
      expectAck: true,
      delayMs: 15,
    });

    sequence.push({
      bytes: this.createCommandFrame(0xf0),
      description: 'CMD_CONFIG_END (0xF0)',
      expectAck: true,
      delayMs: 15,
    });

    await this.executeSequence(sequence);
  }

  public async setLightingPreset(params: {
    mode: number;
    r: number;
    g: number;
    b: number;
    brightness: number;
    speed: number;
    isSingleColor: boolean;
    direction: number;
  }): Promise<void> {
    const sequence: QueuedPacket[] = [];

    sequence.push({
      bytes: this.createCommandFrame(0x18),
      description: 'CMD_CONFIG_BEGIN (0x18)',
      expectAck: true,
      delayMs: 15,
    });

    const prep = this.createCommandFrame(0x13);
    prep[8] = 0x01;
    sequence.push({
      bytes: prep,
      description: 'CMD_SET_RGB_PRESET (0x13) Prep',
      expectAck: true,
      delayMs: 15,
    });

    const cfg = new Uint8Array(64);
    cfg[0] = params.mode & 0xff;
    cfg[1] = params.r & 0xff;
    cfg[2] = params.g & 0xff;
    cfg[3] = params.b & 0xff;
    cfg[8] = params.isSingleColor ? 0x00 : 0x01;
    cfg[9] = Math.min(Math.max(params.brightness, 1), 5);
    cfg[10] = Math.min(Math.max(params.speed, 1), 5);
    cfg[11] =
      params.mode === 10
        ? params.direction
          ? 2
          : 3
        : params.direction
        ? 1
        : 0;
    cfg[14] = 0xaa;
    cfg[15] = 0x55;
    sequence.push({
      bytes: cfg,
      description: `RGB Config (Mode ${params.mode}, BRT ${params.brightness}, SPD ${params.speed})`,
      expectAck: false,
      delayMs: 15,
    });

    sequence.push({
      bytes: this.createCommandFrame(0x02),
      description: 'CMD_SAVE_EEPROM (0x02)',
      expectAck: true,
      delayMs: 15,
    });

    sequence.push({
      bytes: this.createCommandFrame(0xf0),
      description: 'CMD_CONFIG_END (0xF0)',
      expectAck: true,
      delayMs: 15,
    });

    await this.executeSequence(sequence);
  }

  public async setDeviceSettings(params: {
    sleepMinutes: number;
    lockWinKey: boolean;
    swapWinAlt: boolean;
  }): Promise<void> {
    const sequence: QueuedPacket[] = [];

    sequence.push({
      bytes: this.createCommandFrame(0x18),
      description: 'CMD_CONFIG_BEGIN (0x18)',
      expectAck: true,
      delayMs: 15,
    });

    const sleepPrep = this.createCommandFrame(0x1b);
    sleepPrep[8] = 0x01;
    sequence.push({
      bytes: sleepPrep,
      description: 'CMD_SET_SLEEP_TIMEOUT (0x1B) Prep',
      expectAck: true,
      delayMs: 15,
    });

    const sleepData = new Uint8Array(64);
    const clampedMinutes = Math.min(Math.max(params.sleepMinutes, 1), 60);
    sleepData[0] = clampedMinutes & 0xff;
    sleepData[1] = params.lockWinKey ? 0x01 : 0x00;
    sleepData[2] = params.swapWinAlt ? 0x01 : 0x00;
    sleepData[62] = 0xaa;
    sleepData[63] = 0x55;
    sequence.push({
      bytes: sleepData,
      description: `Device Settings (Sleep: ${clampedMinutes}m, WinLock: ${params.lockWinKey}, MacSwap: ${params.swapWinAlt})`,
      expectAck: false,
      delayMs: 15,
    });

    sequence.push({
      bytes: this.createCommandFrame(0x02),
      description: 'CMD_SAVE_EEPROM (0x02)',
      expectAck: true,
      delayMs: 15,
    });

    sequence.push({
      bytes: this.createCommandFrame(0xf0),
      description: 'CMD_CONFIG_END (0xF0)',
      expectAck: true,
      delayMs: 15,
    });

    await this.executeSequence(sequence);
  }
}
