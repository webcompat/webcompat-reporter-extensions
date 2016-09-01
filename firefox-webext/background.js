/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var fetchURL = 'https://api.github.com/repos/webcompat/web-bugs/issues?state=open&page=1&per_page=100';
var issuesList = [];
var requestIssues = [];
var ignoreList = ['about'];
var ts = Math.round(new Date().getTime() / 1000);
var tsRefresh = 0;
var prefix = 'https://webcompat.com/?open=1&url=';
var screenshotData = '';

function addRefresh(now) {
  return (now + (24 * 3600));
}

function checkRefresh (){
  var now = Math.round(new Date().getTime() / 1000);
  if (issuesList.length == 0 || tsRefresh <= now) {
    console.log('Data needs refresh.');
    tsRefresh = addRefresh(now);
    getIssues();
    return true;
  } else {
    console.log('Data up to date.');
    return false;
  }
}

function getIssues() {
  var now = Math.round(new Date().getTime() / 1000);
  tsRefresh = addRefresh(now);
  fetchBatch(fetchURL);
}

function fetchBatch(url){
  fetch(url).then(function(response) {
  	return response;
  }).then(function(obj) {
    Promise.resolve(obj.json()).then(function (list) {
      issuesList.push.apply(issuesList, list);
    }).catch(function(err) {
      console.log(err);
    });
    return obj.headers.get('Link');
  }).then(function(link) {
    var headers = parseHeader(link);
    if (headers.next) {
      fetchBatch(headers.next);
    } else {
      storeIssues();
    }
  }).catch(function(err) {
  	console.log(err);
  });
}

function parseHeader(linkHeader) {
  var result = {};
  var entries = linkHeader.split(',');
  var relsRegExp = /\brel="?([^"]+)"?\s*;?/;
  var keysRegExp = /(\b[0-9a-z\.-]+\b)/g;
  var sourceRegExp = /^<(.*)>/;

  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i].trim();
    var rels = relsRegExp.exec(entry);
    if (rels) {
      var keys = rels[1].match(keysRegExp);
      var source = sourceRegExp.exec(entry)[1];
      var k;
      var kLength = keys.length;
      for (k = 0; k < kLength; k += 1) {
        result[keys[k]] = source;
      }
    }
  }
  return result;
}

function searchIssues(domain, tab){
  var count = 0;
  for (var i = 0; i < issuesList.length; i++) {
   var str = issuesList[i].body.toString();
   if (str.indexOf(domain) !== -1){
     count++;
   }
  }
  if (count > 0){
    chrome.browserAction.setBadgeText({text: count.toString(), tabId: tab});
  } else {
    chrome.browserAction.setBadgeText({text: '', tabId: tab});
  }
}

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.captureVisibleTab({format: 'png'}, function(res) {
    screenshotData = res;
    chrome.tabs.query({currentWindow: true, active: true}, function(tab) {
      chrome.tabs.create({ "url": prefix + encodeURIComponent(tab[0].url)}, function(tab) {
        chrome.tabs.executeScript({
          code: 'window.postMessage("' + screenshotData + '", "*")'
        });
      });
    });
  });
});

function storeIssues() {
  chrome.storage.local.set({issuesList, tsRefresh}, function(){
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError);
    } else {
      console.log("Local store complete.");
    }
  });
}

function storageCheck(item){
  if (chrome.runtime.lastError) {
    console.log(chrome.runtime.lastError);
  } else {
    if (Object.keys(item).length === 0 && item.constructor === Object){
      getIssues(); // if nothing in storage fetch the list from github
    } else {
      issuesList = item.issuesList;
      tsRefresh = item.tsRefresh;
      console.log('Issues loaded from storage.');
      checkRefresh();
    }
  }
}

function extractDomain(url) {
   var domain;
   if (url.indexOf("://") > -1) {
     domain = url.split('/')[2];
   }
   else {
     domain = url.split('/')[0];
   }
   domain = domain.split(':')[0];
   return domain;
}

function navigationChange(details) {
  var url = extractDomain(details.url);
  var tab = details.tabId;
  var parentFrameId = details.parentFrameId;
  if (parentFrameId == -1){
    if (ignoreList.indexOf(url) == -1){
      if (checkRefresh()) {
        setTimeout(function(){ searchIssues(url, tab); }, 5000);
      } else {
        searchIssues(url, tab);
      }
    }
  }
}

chrome.webNavigation.onCompleted.addListener(navigationChange);
chrome.browserAction.setBadgeBackgroundColor({ color: [64, 64, 64, 255] });
chrome.storage.local.get(storageCheck);
