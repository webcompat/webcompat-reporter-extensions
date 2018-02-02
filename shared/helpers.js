/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const PREFIX = "https://webcompat.com/issues/new?url=";

export function createContextMenu() {
  chrome.contextMenus.create({
    id: "webcompat-contextmenu",
    title: "Report site issue",
    contexts: ["all"]
  });
}

export function enableOrDisable(tabId, changeInfo, tab) {
  function isReportableURL(url) {
    if (!url) {
      return false;
    }

    let protocol = new URL(url).protocol;
    return ["http:", "https:"].includes(protocol);
  }

  if (changeInfo.status === "loading" && isReportableURL(tab.url)) {
    chrome.browserAction.enable(tabId);
  } else if (changeInfo.status === "loading" && !isReportableURL(tab.url)) {
    chrome.browserAction.disable(tabId);
  }
}

export function reportIssue(tab, reporterID) {
  chrome.tabs.captureVisibleTab({ format: "png" }, function(res) {
    let screenshotData = res;
    chrome.tabs.query({ currentWindow: true, active: true }, function(tab) {
      var newTabUrl = `${PREFIX}${encodeURIComponent(
        tab[0].url
      )}&src=${reporterID}`;
      chrome.tabs.create({ url: newTabUrl }, function(tab) {
        chrome.tabs.executeScript({
          code: `window.postMessage("${screenshotData}", "*")`
        });
      });
    });
  });
}

export function setupListeners(reporterID) {
  chrome.tabs.onCreated.addListener(tab => {
    // disable all new tabs until they've loaded and we know
    // they have reportable URLs
    chrome.browserAction.disable(tab.tabId);
  });
  chrome.tabs.onUpdated.addListener(enableOrDisable);
  chrome.contextMenus.onClicked.addListener(tab =>
    reportIssue(tab, reporterID)
  );
  chrome.browserAction.onClicked.addListener(tab =>
    reportIssue(tab, reporterID)
  );
}
