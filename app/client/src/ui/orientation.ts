import type Phaser from 'phaser';

const PORTRAIT_THRESHOLD_PX = 1; // hysteresis is unnecessary; resize already debounces visually

type OrientationCallback = (isPortrait: boolean) => void;

export function setupOrientationLock(
  overlay: HTMLElement,
  game: Phaser.Game,
  onChange?: OrientationCallback,
): () => void {
  const update = () => {
    const isPortrait = window.innerHeight > window.innerWidth + PORTRAIT_THRESHOLD_PX;
    overlay.hidden = !isPortrait;

    // Pause the game loop while portrait so timers/tweens don't drift.
    if (isPortrait) {
      if (!game.loop.actualFps || !game.scene.isPaused('__noop__')) {
        game.loop.sleep();
      }
    } else {
      game.loop.wake();
    }

    onChange?.(isPortrait);
  };

  // Best-effort screen-orientation lock; unsupported on most desktop browsers.
  // Wrapped because requesting on a non-fullscreen page throws on some engines.
  const tryLockLandscape = () => {
    const orientation = screen.orientation as
      | (ScreenOrientation & { lock?: (o: string) => Promise<void> })
      | undefined;
    if (orientation && typeof orientation.lock === 'function') {
      orientation.lock('landscape').catch(() => { /* not supported / not allowed */ });
    }
  };

  window.addEventListener('resize', update);
  window.addEventListener('orientationchange', update);
  document.addEventListener('fullscreenchange', tryLockLandscape);

  update();

  return () => {
    window.removeEventListener('resize', update);
    window.removeEventListener('orientationchange', update);
    document.removeEventListener('fullscreenchange', tryLockLandscape);
  };
}
