/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import isReportableURL from "../shared/reportableUrl.js";

const PREFIX = "https://webcompat.com/issues/new?url=";

function createContextMenu() {
  chrome.contextMenus.create({
    id: "webcompat-contextmenu",
    title: "Report site issue",
    contexts: ["all"]
  });
}

function enableOrDisable(tabId, changeInfo, tab) {
  if (changeInfo.status === "loading" && isReportableURL(tab.url)) {
    chrome.browserAction.enable(tabId);
  } else if (changeInfo.status === "loading" && !isReportableURL(tab.url)) {
    chrome.browserAction.disable(tabId);
  }
}

function reportIssue(tab, reporterID) {
  chrome.tabs.captureVisibleTab({ format: "png" }, function(res) {
    let screenshotData = res;
    chrome.tabs.query({ currentWindow: true, active: true }, function(tab) {
      var newTabUrl = `${PREFIX}${encodeURIComponent(
        tab[0].url
      )}&src=${reporterID}`;
      chrome.tabs.create({ url: newTabUrl }, function(tab) {
        chrome.tabs.executeScript(tab.id, {
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
    reportIssue(tab, reporterID)
  );

  if (options && options.createContextMenu) {
    chrome.contextMenus.onClicked.addListener(tab =>
      reportIssue(tab, reporterID)
    );
  }
}

export default function initAddon(reporterID, options = false) {
  if (options && options.createContextMenu) {
    createContextMenu();
  }
  setupListeners(reporterID, options);
}
