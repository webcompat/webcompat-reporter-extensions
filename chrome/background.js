/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var prefix = 'https://webcompat.com/issues/new?url=';
var screenshotData = '';

chrome.contextMenus.create({
  id: 'webcompat-contextmenu',
  title: 'Report site issue',
  contexts: ['all']
});


function reportIssue(tab) {
  chrome.tabs.captureVisibleTab({format: 'png'}, function(res) {
    screenshotData = res;
    chrome.tabs.query({currentWindow: true, active: true}, function(tab) {
      chrome.tabs.create({ 'url': prefix + encodeURIComponent(tab[0].url)}, function(tab) {
        chrome.tabs.executeScript({
          code: `window.postMessage("${screenshotData}", "*")`
        });
      });
    });
  });
}

chrome.contextMenus.onClicked.addListener(reportIssue);
chrome.browserAction.onClicked.addListener(reportIssue);
