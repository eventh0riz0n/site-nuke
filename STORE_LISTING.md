# Chrome Web Store listing draft — Site Nuke

## Name
Site Nuke – Clear Data for Current Tab

## Short description
One-click: clear cookies and site data for the current tab only, then reload.

## Detailed description
Site Nuke is a minimal Chrome/Brave extension for developers.

With a single click, it clears **cookies and site data only for the currently active tab** (origin), then reloads the page.

### Clears (current site only)
- Cookies
- Local Storage
- IndexedDB
- Service Workers
- Cache Storage

### Notes
- No analytics, no telemetry, no servers.
- The extension only runs when you click it.

## Category
Developer Tools / Productivity

## Permissions justification
- `tabs` / `activeTab`: detect the current tab and reload it after clearing.
- `cookies`: list and remove cookies for the current site.
- `browsingData`: remove site data for the current origin.
- Host permissions (`http://*/*`, `https://*/*`): required for cookie operations on the current site.

## URLs
- Homepage: https://github.com/eventh0riz0n/site-nuke
- Support: https://github.com/eventh0riz0n/site-nuke/issues
- Privacy policy: https://github.com/eventh0riz0n/site-nuke/blob/main/PRIVACY_POLICY.md

## Keywords
clear cookies, clear site data, devtools, local storage, indexeddb, service worker, cache storage
