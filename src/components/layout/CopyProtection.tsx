'use client';

import { useEffect } from 'react';

const PROTECTED_SELECTOR = '[data-copy-protect]';
const ALLOWED_SELECTOR = 'input, textarea, select, button, [contenteditable="true"], [data-allow-copy]';

function getProtectedRoot(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  const protectedRoot = target.closest(PROTECTED_SELECTOR);
  if (!protectedRoot) return null;
  if (target.closest(ALLOWED_SELECTOR)) return null;
  return protectedRoot;
}

export default function CopyProtection() {
  useEffect(() => {
    const preventIfProtected = (event: Event) => {
      if (getProtectedRoot(event.target)) {
        event.preventDefault();
      }
    };

    const preventProtectedShortcuts = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (!getProtectedRoot(event.target)) return;

      const key = event.key.toLowerCase();
      if (key === 'c' || key === 'x' || key === 'a') {
        event.preventDefault();
      }
    };

    document.addEventListener('copy', preventIfProtected);
    document.addEventListener('cut', preventIfProtected);
    document.addEventListener('contextmenu', preventIfProtected);
    document.addEventListener('selectstart', preventIfProtected);
    document.addEventListener('dragstart', preventIfProtected);
    document.addEventListener('keydown', preventProtectedShortcuts);

    return () => {
      document.removeEventListener('copy', preventIfProtected);
      document.removeEventListener('cut', preventIfProtected);
      document.removeEventListener('contextmenu', preventIfProtected);
      document.removeEventListener('selectstart', preventIfProtected);
      document.removeEventListener('dragstart', preventIfProtected);
      document.removeEventListener('keydown', preventProtectedShortcuts);
    };
  }, []);

  return null;
}
