(() => {
  'use strict';

  const MARK = 'data-checks-expander';
  const OVERLAY_MAX_HEIGHT = '80vh';
  const RUN_LINKS = 'a[href*="/runs/"], a[href*="check_run_id="]';
  const MERGE_BOX = '[data-testid*="mergebox" i], [data-testid*="merge-box" i]';
  const USER_CONTENT = '.markdown-body, .comment-body';

  /** Reports whether a computed style describes a vertical scroller with a positive height cap. */
  function isCapped(style) {
    if (style.overflowY !== 'auto' && style.overflowY !== 'scroll') return false;
    return parseFloat(style.maxHeight) > 0;
  }

  /** Reports whether the element lives in a floating layer (popover, dropdown, dialog). */
  function inOverlay(el) {
    for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) {
      const position = getComputedStyle(e).position;
      if (position === 'fixed' || position === 'absolute') return true;
    }
    return false;
  }

  function expand(el) {
    el.style.setProperty('max-height', inOverlay(el) ? OVERLAY_MAX_HEIGHT : 'none', 'important');
    el.setAttribute(MARK, '');
  }

  /** Drops the override from elements GitHub no longer caps, e.g. a section collapsed via max-height: 0. */
  function recheckExpanded() {
    for (const el of document.querySelectorAll(`[${MARK}]`)) {
      el.style.removeProperty('max-height');
      if (isCapped(getComputedStyle(el))) expand(el);
      else el.removeAttribute(MARK);
    }
  }

  /** Collects merge box descendants and ancestors of CI run links outside user-written content. */
  function candidates() {
    const found = new Set();
    for (const root of document.querySelectorAll(MERGE_BOX)) {
      for (const el of root.querySelectorAll('*')) found.add(el);
    }
    const walked = new Set();
    for (const link of document.querySelectorAll(RUN_LINKS)) {
      if (link.closest(USER_CONTENT)) continue;
      for (let el = link.parentElement; el && el !== document.body && !walked.has(el); el = el.parentElement) {
        walked.add(el);
        found.add(el);
      }
    }
    return found;
  }

  function scan() {
    // Style-only reads first: no layout while overrides are removed.
    recheckExpanded();
    for (const el of candidates()) {
      if (el.hasAttribute(MARK) || el.scrollHeight <= el.clientHeight) continue;
      if (isCapped(getComputedStyle(el))) expand(el);
    }
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      scan();
    });
  }

  new MutationObserver(schedule).observe(document, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class'],
  });
  document.addEventListener('transitionend', schedule, true);
  schedule();
})();
