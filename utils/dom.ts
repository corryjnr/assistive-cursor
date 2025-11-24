/**
 * Scans the DOM for standard interactive elements to support "Universal Overlay" mode.
 * Filters out hidden, disabled, or already tagged elements.
 */
export const getInteractiveElements = (): HTMLElement[] => {
  const selectors = [
    'button',
    'a[href]',
    'input:not([type="hidden"])',
    'select',
    'textarea',
    '[role="button"]',
    '[tabindex]:not([tabindex="-1"])'
  ];

  const elements = document.querySelectorAll(selectors.join(','));
  const interactive: HTMLElement[] = [];

  elements.forEach((el) => {
    const htmlEl = el as HTMLElement;

    // 1. Visibility Check
    // offsetParent is null if element or any parent is display: none
    if (!htmlEl.offsetParent) return;

    // 2. Disabled Check
    if (htmlEl.hasAttribute('disabled') || htmlEl.getAttribute('aria-disabled') === 'true') return;

    // 3. Exclusion Check
    // Don't double count elements that are already manually tagged for the game/workspace
    // Also ignore elements explicitly marked to be ignored (like the control panel container)
    if (htmlEl.getAttribute('data-neuro-target') === 'true') return;
    if (htmlEl.closest('[data-neuro-target="false"]')) return;

    interactive.push(htmlEl);
  });

  return interactive;
};