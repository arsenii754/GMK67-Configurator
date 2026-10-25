import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Usb, Terminal, Check, Copy, X, Keyboard as KeyboardIcon, Activity, ShieldCheck } from 'lucide-react';

export type TopTab = 'CONFIGURE' | 'KEY TESTER';

interface HeaderProps {
  activeTab: TopTab;
  onSelectTab: (tab: TopTab) => void;
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

const UDEV_RULE = `KERNEL=="hidraw*", ATTRS{idVendor}=="05ac", ATTRS{idProduct}=="024f", MODE="0666", TAG+="uaccess"`;
const UDEV_COMMAND = `echo '${UDEV_RULE}' | sudo tee /etc/udev/rules.d/99-gmk67.rules && sudo udevadm control --reload-rules && sudo udevadm trigger`;

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  isConnected,
  isConnecting,
  onConnect,
  onDisconnect,
}) => {
  const [showUdevModal, setShowUdevModal] = useState(false);
  const [copiedRule, setCopiedRule] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [installingUdev, setInstallingUdev] = useState(false);
  const [udevStatus, setUdevStatus] = useState<string | null>(null);

  const isTauri =
    typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
  const isLinux =
    typeof navigator !== 'undefined' &&
    /linux/i.test(navigator.userAgent || navigator.platform || '');

  const copyText = async (text: string, type: 'rule' | 'cmd') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'rule') {
        setCopiedRule(true);
        setTimeout(() => setCopiedRule(false), 2000);
      } else {
        setCopiedCmd(true);
        setTimeout(() => setCopiedCmd(false), 2000);
      }
    } catch {
    }
  };

  const handleAutoInstallUdev = async () => {
    setInstallingUdev(true);
    setUdevStatus(null);
    try {
      await invoke('gmk67_setup_udev');
      setUdevStatus('Installed udev rule and reloaded permissions.');
      onConnect();
    } catch (err: unknown) {
      setUdevStatus(err instanceof Error ? err.message : String(err));
    } finally {
      setInstallingUdev(false);
    }
  };

  const tabs: { id: TopTab; label: string; icon: React.ReactNode }[] = [
    { id: 'CONFIGURE', label: 'CONFIGURE', icon: <KeyboardIcon className="w-3.5 h-3.5" /> },
    { id: 'KEY TESTER', label: 'KEY TESTER', icon: <Activity className="w-3.5 h-3.5" /> },
  ];

  return (
    <>
      <header className="h-12 min-h-[48px] bg-[#1b1b1e] border-b border-[#2c2c31] px-5 flex items-center justify-between select-none z-20">
        <div className="min-w-[220px]" />

        <nav className="flex items-center h-full">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`relative h-full px-5 flex items-center gap-2 text-xs font-semibold tracking-[0.14em] transition-colors ${
                  active
                    ? 'text-[#e4e4e7] bg-[#242427]/60'
                    : 'text-[#71717a] hover:text-[#d4d4d8]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d89587]" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-2.5 min-w-[220px]">
          {isLinux && (
            <button
              onClick={() => setShowUdevModal(true)}
              title="Linux /dev/hidraw* udev permissions notice"
              className="h-7 px-2.5 rounded bg-[#242427] hover:bg-[#2c2c31] border border-[#34343a] text-[#a1a1aa] hover:text-[#e4e4e7] flex items-center gap-1.5 text-[11px] font-medium transition-colors"
            >
              <Terminal className="w-3.5 h-3.5 text-[#d89587]" />
              <span>udev</span>
            </button>
          )}

          <div
            className={`h-7 px-3 rounded-full border flex items-center gap-2 text-[11px] font-mono font-medium tracking-wider ${
              isConnected
                ? 'bg-[#1f2922] border-[#2e4736] text-[#a7f3d0]'
                : 'bg-[#242427] border-[#323238] text-[#a1a1aa]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-[#34d399]' : 'bg-[#71717a]'
              }`}
            />
            <span>{isConnected ? 'ZUOYA GMK67' : 'DISCONNECTED'}</span>
          </div>

          {isConnected ? (
            <button
              onClick={onDisconnect}
              className="h-7 px-3 rounded bg-[#2c2c31] hover:bg-[#36363c] border border-[#3f3f46] text-[#e4e4e7] text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Usb className="w-3.5 h-3.5 text-[#d89587]" />
              <span>Disconnect</span>
            </button>
          ) : (
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className="h-7 px-3 rounded bg-[#d89587] hover:bg-[#c48b7f] active:bg-[#b57d71] text-[#141416] text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
            >
              <Usb className="w-3.5 h-3.5" />
              <span>{isConnecting ? 'Connecting...' : 'Connect Keyboard'}</span>
            </button>
          )}
        </div>
      </header>

      {showUdevModal && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setShowUdevModal(false)}
        >
          <div
            className="w-full max-w-xl bg-[#1b1b1e] border border-[#323238] rounded-lg shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 bg-[#242427] border-b border-[#323238] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#d89587]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#e4e4e7]">
                  Linux /dev/hidraw* Permission Notice
                </h3>
              </div>
              <button
                onClick={() => setShowUdevModal(false)}
                className="text-[#a1a1aa] hover:text-[#e4e4e7] p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-[#a1a1aa] leading-relaxed">
              <p>
                On Linux, <code className="px-1.5 py-0.5 rounded bg-[#242427] text-[#e4e4e7] font-mono">/dev/hidraw*</code> device nodes are created by the kernel with <code className="text-[#d89587] font-mono">root:root (0600)</code> permissions by default. A one-time <code className="text-[#e4e4e7] font-mono">udev</code> rule is required so non-root applications can read and write to the keyboard without <code className="text-[#e4e4e7] font-mono">sudo</code>.
              </p>

              {isTauri && (
                <div className="p-3 rounded bg-[#141416] border border-[#2c2c31] flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-[#e4e4e7]">
                      Automatic Setup
                    </div>
                    <div className="text-[11px] text-[#71717a]">
                      Install rule and reload udev via system authentication prompt
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoInstallUdev}
                    disabled={installingUdev}
                    className="h-7 px-3 rounded bg-[#d89587] hover:bg-[#c48b7f] text-[#141416] text-xs font-semibold flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{installingUdev ? 'Installing...' : 'Install Rule'}</span>
                  </button>
                </div>
              )}

              {udevStatus && (
                <div className="text-[11px] font-mono text-[#d89587]">
                  {udevStatus}
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#d4d4d8]">
                    1. Udev Rule (/etc/udev/rules.d/99-gmk67.rules)
                  </span>
                  <button
                    onClick={() => copyText(UDEV_RULE, 'rule')}
                    className="flex items-center gap-1 text-[11px] text-[#d89587] hover:underline"
                  >
                    {copiedRule ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedRule ? 'Copied' : 'Copy Rule'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded bg-[#141416] border border-[#2c2c31] font-mono text-[11px] text-[#e4e4e7] overflow-x-auto">
                  {UDEV_RULE}
                </pre>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#d4d4d8]">
                    2. Terminal Command
                  </span>
                  <button
                    onClick={() => copyText(UDEV_COMMAND, 'cmd')}
                    className="flex items-center gap-1 text-[11px] text-[#d89587] hover:underline"
                  >
                    {copiedCmd ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCmd ? 'Copied' : 'Copy Command'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded bg-[#141416] border border-[#2c2c31] font-mono text-[11px] text-[#e4e4e7] overflow-x-auto whitespace-pre-wrap break-all">
                  {UDEV_COMMAND}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
