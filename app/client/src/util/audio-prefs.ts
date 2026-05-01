import Phaser from 'phaser';
import { REGISTRY_MUSIC_MUTED, REGISTRY_SFX_MUTED } from '../scenes/LoadingScene';

export type AudioPrefKind = 'music' | 'sfx';

const STORAGE_KEY_MUSIC = 'webMilitia.musicMuted';
const STORAGE_KEY_SFX = 'webMilitia.sfxMuted';

const storageKey = (kind: AudioPrefKind) =>
  kind === 'music' ? STORAGE_KEY_MUSIC : STORAGE_KEY_SFX;

const registryKey = (kind: AudioPrefKind) =>
  kind === 'music' ? REGISTRY_MUSIC_MUTED : REGISTRY_SFX_MUTED;

function readBool(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === 'true';
  } catch {
    // Storage unavailable (private mode, sandboxed contexts) — treat as default.
    return false;
  }
}

function writeBool(key: string, value: boolean): void {
  try {
    window.localStorage.setItem(key, value ? 'true' : 'false');
  } catch {
    // Persistence is best-effort; ignore quota / availability failures.
  }
}

// Hydrate the game registry from localStorage. Safe to call multiple times.
export function loadAudioPrefs(scene: Phaser.Scene): void {
  scene.registry.set(REGISTRY_MUSIC_MUTED, readBool(STORAGE_KEY_MUSIC));
  scene.registry.set(REGISTRY_SFX_MUTED, readBool(STORAGE_KEY_SFX));
}

export function setAudioPref(
  scene: Phaser.Scene,
  kind: AudioPrefKind,
  muted: boolean,
): void {
  scene.registry.set(registryKey(kind), muted);
  writeBool(storageKey(kind), muted);
}
