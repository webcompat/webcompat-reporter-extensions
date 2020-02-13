/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import isReportableURL from "./checkurl.js";

const PREFIX = "https://webcompat.com/issues/new";

function createContextMenu() {
  chrome.contextMenus.create({
    id: "webcompat-contextmenu",
    title: chrome.i18n.getMessage("contextMenuTitle"),
    contexts: ["all"]
  });
}

function enableOrDisableOnActive(activeInfo) {
  const activeId = activeInfo.tabId;
  chrome.tabs.get(activeId, tab => {
    if (isReportableURL(tab.url)) {
      chrome.browserAction.enable(activeId);
    } else {
      chrome.browserAction.disable(activeId);
    }
  });
}

function enableOrDisableOnUpdate(tabId, changeInfo, tab) {
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
      const json = JSON.stringify({
        url: tab[0].url,
        src: reporterID,
        utm_source: reporterID,
        utm_campaign: "report-site-issue-extension"
      });

      chrome.tabs.create({ url: PREFIX }, function(tab) {
        chrome.tabs.executeScript(tab.id, {
          runAt: "document_end",
          code: `
            async function postMessageData(dataURI, metadata) {
               const res = await fetch(dataURI);
               const blob = await res.blob();
               const data = {
                 screenshot: blob,
                 message: metadata
               };
               postMessage(data, "*");
            }
            postMessageData("${screenshotData}", ${json});
          `
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
  chrome.tabs.onUpdated.addListener(enableOrDisableOnUpdate);
  chrome.tabs.onActivated.addListener(enableOrDisableOnActive);
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
