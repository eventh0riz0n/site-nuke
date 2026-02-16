// Site Nuke – MV3 service worker
// One click: clear cookies + site data for the active tab origin, then reload.
// Chrome/Brave (Chromium).

const BADGE_MS = 2000;

function setBadge(text) {
  return new Promise((resolve) => chrome.action.setBadgeText({ text }, resolve));
}

function setBadgeColor(color) {
  return new Promise((resolve) =>
    chrome.action.setBadgeBackgroundColor({ color }, resolve)
  );
}

function clearBadgeLater() {
  setTimeout(() => chrome.action.setBadgeText({ text: "" }), BADGE_MS);
}

function getActiveTab() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const err = chrome.runtime.lastError;
      if (err) return reject(err);
      if (!tabs?.length) return reject(new Error("No active tab"));
      resolve(tabs[0]);
    });
  });
}

function reloadTab(tabId) {
  return new Promise((resolve) => chrome.tabs.reload(tabId, {}, resolve));
}

function getCookiesForUrl(url) {
  return new Promise((resolve, reject) => {
    chrome.cookies.getAll({ url }, (cookies) => {
      const err = chrome.runtime.lastError;
      if (err) return reject(err);
      resolve(cookies || []);
    });
  });
}

function removeCookie(url, name, storeId) {
  return new Promise((resolve) => {
    chrome.cookies.remove({ url, name, storeId }, () => resolve());
  });
}

function removeBrowsingDataForOrigin(origin, dataTypes) {
  return new Promise((resolve, reject) => {
    chrome.browsingData.remove({ origins: [origin] }, dataTypes, () => {
      const err = chrome.runtime.lastError;
      if (err) return reject(err);
      resolve();
    });
  });
}

function isHttpUrl(s) {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function cookieRemovalUrl(cookie, tabUrlObj) {
  // cookies.remove requires scheme+host+path; secure cookies must use https
  const scheme = cookie.secure ? "https://" : (tabUrlObj.protocol === "https:" ? "https://" : "http://");
  const host = (cookie.domain || tabUrlObj.hostname).replace(/^\./, "");
  const path = cookie.path || "/";
  return `${scheme}${host}${path}`;
}

async function nukeCurrentTab() {
  const tab = await getActiveTab();

  if (!tab?.url || !isHttpUrl(tab.url)) {
    await setBadgeColor("#b00020");
    await setBadge("ERR");
    clearBadgeLater();
    return;
  }

  const urlObj = new URL(tab.url);
  const origin = urlObj.origin;

  // 1) cookies (best effort)
  let cookieErrors = 0;
  try {
    const cookies = await getCookiesForUrl(tab.url);
    await Promise.all(
      cookies.map(async (c) => {
        try {
          await removeCookie(cookieRemovalUrl(c, urlObj), c.name, c.storeId);
        } catch (e) {
          cookieErrors++;
          console.warn("Cookie remove failed:", e);
        }
      })
    );
  } catch (e) {
    cookieErrors++;
    console.warn("Cookie listing failed:", e);
  }

  // 2) site data for origin (best effort)
  const dataTypes = {
    cookies: true,
    localStorage: true,
    indexedDB: true,
    serviceWorkers: true,
    cacheStorage: true,
    webSQL: true,
    fileSystems: true
  };

  let bdError = null;
  try {
    await removeBrowsingDataForOrigin(origin, dataTypes);
  } catch (e) {
    bdError = e;
    console.warn("browsingData.remove failed:", e);
    // retry smaller set
    try {
      await removeBrowsingDataForOrigin(origin, {
        cookies: true,
        localStorage: true,
        indexedDB: true,
        serviceWorkers: true,
        cacheStorage: true
      });
      bdError = null;
    } catch (e2) {
      bdError = e2;
      console.warn("browsingData.remove retry failed:", e2);
    }
  }

  // 3) reload regardless
  await reloadTab(tab.id);

  // feedback
  if (bdError) {
    await setBadgeColor("#b00020");
    await setBadge("ERR");
  } else if (cookieErrors > 0) {
    await setBadgeColor("#f57c00");
    await setBadge("OK");
  } else {
    await setBadgeColor("#1b5e20");
    await setBadge("OK");
  }
  clearBadgeLater();
}

chrome.runtime.onInstalled.addListener(() => {
  // Optional uninstall feedback page (no tracking; user can ignore).
  try {
    chrome.runtime.setUninstallURL("https://eventh0riz0n.github.io/site-nuke/uninstall.html");
  } catch {}
});

chrome.action.onClicked.addListener(() => {
  nukeCurrentTab().catch(async (e) => {
    console.error("Unexpected failure:", e);
    await setBadgeColor("#b00020");
    await setBadge("ERR");
    clearBadgeLater();
  });
});
