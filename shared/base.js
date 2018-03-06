/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const PREFIX = "https://webcompat.com/issues/new?url=";

function createContextMenu() {
  chrome.contextMenus.create({
    id: "webcompat-contextmenu",
    title: "Report site issue",
    contexts: ["all"]
  });
}

function enableOrDisable(tabId, changeInfo, tab) {
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

function reportIssue(tab, reporterID, tabId) {
  chrome.tabs.captureVisibleTab({ format: "png" }, function(res) {
    let screenshotData = res;
    chrome.tabs.query({ currentWindow: true, active: true }, function(tab) {
      var newTabUrl = `${PREFIX}${encodeURIComponent(
        tab[0].url
      )}&src=${reporterID}`;
      chrome.tabs.create({ url: newTabUrl }, function(tab) {
        chrome.tabs.executeScript(tabId, {
          code: `window.postMessage("${screenshotData}", "*")`
        });
      });
    });
  });
}

function setupListeners(reporterID, options) {
  chrome.tabs.onCreated.addListener(tab => {
    // disable all new tabs until they've loaded and we know
    // they have reportable URLs
    chrome.browserAction.disable(tab.tabId);
  });
  chrome.tabs.onUpdated.addListener(enableOrDisable);
  chrome.browserAction.onClicked.addListener(tab =>
    reportIssue(tab, reporterID, tab.tabId)
  );

  if (options && options.createContextMenu) {
    chrome.contextMenus.onClicked.addListener(tab =>
      reportIssue(tab, reporterID, tab.tabId)
    );
  }
}

export default function initAddon(reporterID, options = false) {
  if (options && options.createContextMenu) {
    createContextMenu();
  }
  setupListeners(reporterID, options);
}
