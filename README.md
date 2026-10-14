# GitHub PR Checks Expander

A tiny browser extension that removes the height cap on the checks list in a GitHub pull request's merge box, so every CI job is visible at once instead of ~5 rows behind an inner scrollbar.

It is a single content script with no dependencies and no permissions beyond running on `github.com`.

## What it changes

| Element | GitHub default | With extension |
| --- | --- | --- |
| Merge box checks list (and other merge box sections) | 300px, scrolls | full height |
| Legacy merge box checks list | 231px, scrolls | full height |
| Commit status popover (✓/✗ next to a commit) | 230–380px | 80% of viewport |

Collapsing a section via its header still works.

## How it finds the checks list

GitHub's hashed CSS class names change without notice (`MergeBoxExpandable-module__expandableContent__xCBlh` became `expandableContent__0_lr6T`, for example), so the extension doesn't depend on them. It looks for elements that:

1. contain a link to a CI run (`/runs/` or `check_run_id=`), outside comment bodies, **or** sit inside an element whose `data-testid` contains `mergebox`, **and**
2. scroll vertically, have a positive `max-height`, and are actually cutting off content.

Matching elements get an inline `max-height: none`, or `80vh` when they're inside a floating popover. A `MutationObserver` re-runs the check whenever the page changes, which covers in-page navigation and lazily loaded checks. When GitHub collapses an element by setting `max-height: 0`, the override is dropped.

## Install

**Chrome / Edge / Brave**

1. Open `chrome://extensions` and enable *Developer mode*.
2. Click *Load unpacked* and select this directory.

**Firefox**

1. Open `about:debugging#/runtime/this-firefox`.
2. Click *Load Temporary Add-on…* and select `manifest.json`.

Temporary add-ons are removed when Firefox restarts. For a permanent install, sign it via [addons.mozilla.org](https://addons.mozilla.org/developers/) (an unlisted self-distributed add-on is fine):

```sh
zip -r github-pr-checks-expander.zip manifest.json expand-checks.js
```

## If it stops working

Run this in the DevTools console on the PR page to list every capped scroller and whether it contains CI run links:

```js
[...document.querySelectorAll('*')]
  .filter(e => /auto|scroll/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight)
  .map(e => ({ el: e, maxHeight: getComputedStyle(e).maxHeight, runLinks: e.querySelectorAll('a[href*="/runs/"]').length, testid: e.closest('[data-testid]')?.dataset.testid }))
```

The checks list is the entry with a fixed `maxHeight`. If it has no run links and no `mergebox` test id, add whatever stable attribute it does have to `RUN_LINKS` or `MERGE_BOX` in `expand-checks.js`.
