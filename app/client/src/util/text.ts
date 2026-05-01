import Phaser from 'phaser';

// Phaser draws text into an internal canvas at its nominal pixel size, then
// uploads that canvas as a texture. With Scale.FIT, the game canvas is then
// stretched to fill the viewport, so any text texture rendered at 1× ends up
// bilinearly upscaled — the source of the "pixelated text" look.
//
// setResolution multiplies the internal canvas size, so the texture matches
// the device's actual DPI. Capped at 3 to bound memory use on high-DPI screens.
const TEXT_RESOLUTION = Math.min(3, Math.max(2, window.devicePixelRatio || 2));

export function addText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  content: string,
  style: Phaser.Types.GameObjects.Text.TextStyle,
): Phaser.GameObjects.Text {
  return scene.add.text(x, y, content, style).setResolution(TEXT_RESOLUTION);
}
