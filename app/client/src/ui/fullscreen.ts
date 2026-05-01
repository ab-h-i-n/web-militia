type FsDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
};

type FsElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void>;
};

export function setupFullscreenButton(button: HTMLButtonElement): () => void {
  const doc = document as FsDocument;
  const root = document.documentElement as FsElement;

  const isFullscreen = () =>
    Boolean(doc.fullscreenElement || doc.webkitFullscreenElement);

  // The Fullscreen API is unavailable on iOS Safari for arbitrary elements.
  // Hide the button entirely there so we don't show a control that does nothing.
  const apiSupported =
    typeof root.requestFullscreen === 'function' ||
    typeof root.webkitRequestFullscreen === 'function';

  if (!apiSupported) {
    button.hidden = true;
    return () => { /* nothing to clean up */ };
  }

  const update = () => {
    button.hidden = isFullscreen();
  };

  const onClick = async () => {
    try {
      if (isFullscreen()) {
        await (doc.exitFullscreen?.() ?? doc.webkitExitFullscreen?.());
      } else {
        await (root.requestFullscreen?.() ?? root.webkitRequestFullscreen?.());
      }
    } catch {
      // user gesture rejected or API blocked — leave the button visible
    }
  };

  button.addEventListener('click', onClick);
  document.addEventListener('fullscreenchange', update);
  document.addEventListener('webkitfullscreenchange', update);

  update();

  return () => {
    button.removeEventListener('click', onClick);
    document.removeEventListener('fullscreenchange', update);
    document.removeEventListener('webkitfullscreenchange', update);
  };
}
