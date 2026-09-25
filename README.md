# GitHub PR Checks Expander

A tiny browser extension that removes the height cap on the checks list in a GitHub pull request's merge box, so every CI job is visible at once instead of ~5 rows behind an inner scrollbar.

It is a single CSS file, with no JavaScript and no permissions beyond injecting that stylesheet on `github.com`.

## What it changes

| Element | GitHub default | With extension |
| --- | --- | --- |
| Merge box checks list (and other merge box sections) | 300px, scrolls | full height |
| Legacy merge box checks list | 231px, scrolls | full height |
| Commit status popover (✓/✗ next to a commit) | 230–380px | 80% of viewport |

Collapsing a section via its header still works.

## Install

**Chrome / Edge / Brave**

1. Open `chrome://extensions` and enable *Developer mode*.
2. Click *Load unpacked* and select this directory.

**Firefox**

1. Open `about:debugging#/runtime/this-firefox`.
2. Click *Load Temporary Add-on…* and select `manifest.json`.

Temporary add-ons are removed when Firefox restarts. For a permanent install, sign it via [addons.mozilla.org](https://addons.mozilla.org/developers/) (an unlisted self-distributed add-on is fine):

```sh
zip -r github-pr-checks-expander.zip manifest.json expand-checks.css
```

## If it stops working

GitHub's React UI uses hashed CSS module class names such as `MergeBoxExpandable-module__expandableContent__xCBlh`. The stylesheet matches them by prefix (`[class*="MergeBoxExpandable-module__expandableContent"]`), so hash changes don't break it, but a component rename would. In that case, inspect the checks list in DevTools, find the element with `max-height` and `overflow-y: auto`, and update the selector in `expand-checks.css`.
