/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var prefix = 'https://webcompat.com/issues/new?url=';
var screenshotData = '';
var reporterID = 'addon-reporter-firefox';

chrome.contextMenus.create({
  id: 'webcompat-contextmenu',
  title: 'Report site issue',
  contexts: ['all']
});

function reportIssue(tab) {
  chrome.tabs.captureVisibleTab({format: 'png'}, function(res) {
    screenshotData = res;
    chrome.tabs.query({currentWindow: true, active: true}, function(tab) {
      var newTabUrl =
        `${prefix}${encodeURIComponent(tab[0].url)}&src=${reporterID}`;
      chrome.tabs.create({ 'url': newTabUrl}, function(tab) {
        chrome.tabs.executeScript({
          code: `window.postMessage("${screenshotData}", "*")`
        });
      });
    });
  });
}

function enableOrDisable(tabId, changeInfo, tab) {
  function isReportableURL(url) {
    return url && !(url.startsWith("about")     ||
                    url.startsWith("chrome")    ||
                    url.startsWith("file")      ||
                    url.startsWith("resource")  ||
                    url.startsWith("view-source"));
  }

  if (changeInfo.status == "loading" && isReportableURL(tab.url)) {
    chrome.browserAction.enable(tabId);
  } else if (changeInfo.status == "loading" && !isReportableURL(tab.url)) {
    chrome.browserAction.disable(tabId);
  }
}

chrome.tabs.onCreated.addListener((tab) => {
  // disable all new tabs until they've loaded and we know
  // they have reportable URLs
  chrome.browserAction.disable(tab.tabId);
})
chrome.tabs.onUpdated.addListener(enableOrDisable);
chrome.contextMenus.onClicked.addListener(reportIssue);
chrome.browserAction.onClicked.addListener(reportIssue);
