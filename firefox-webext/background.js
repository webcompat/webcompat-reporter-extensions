/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var pre = 'https://api.github.com/repos/webcompat/web-bugs';
var ext1 = '/issues?state=open&page=';
var ext2 = '&per_page=100';
var issuesList = [];
var requestIssues = [];
var requestsTotal = 0;
var requestsCount = 0;
var ts = Math.round(new Date().getTime() / 1000);
var tsRefresh = 0;
var prefix = 'https://webcompat.com/?open=1&url=';
var screenshotData = '';

function handleMessage(request, sender, sendResponse) {
  if (checkRefresh()) {
    setTimeout(function(){ searchIssues(request.message, sender.tab.id);}, 5000);
  } else {
    searchIssues(request.message, sender.tab.id);
  }
}

function addRefresh(now) {
  return (now + (24 * 3600));
}

function checkRefresh (){
  var now = Math.round(new Date().getTime() / 1000);
  if (issuesList.length == 0 || tsRefresh <= now) {
    console.log('Data needs refresh.');
    tsRefresh = addRefresh(now);
    getIssuesCount();
    return true;
  } else {
    console.log('Data up to date.');
    return false;
  }
}

function getIssuesCount() {
  var now = Math.round(new Date().getTime() / 1000);
  tsRefresh = addRefresh(now);
  requestCount.open('GET', pre, true);
  requestCount.send(null);
}

var requestCount = new XMLHttpRequest();
requestCount.onreadystatechange = function() {
  if (requestCount.readyState == XMLHttpRequest.DONE) {
    var obj = JSON.parse(requestCount.responseText);
    var n = parseInt(obj.open_issues);
    if (n >= 100){
      var t = parseInt(n.toString().substr(0,1))+1;
      getIssues(t);
    } else {
      getIssues(1);
    }
  }
}

function getIssues(pages) {
  requestsTotal = pages; requestCount = 0;
  for (var i = 1; i <= pages; i++) {
   var api = pre + ext1 + i + ext2;
   requestIssues[i] = new XMLHttpRequest();
   requestIssues[i].onreadystatechange = function(index) {
     return function() {
       if (requestIssues[index].readyState == XMLHttpRequest.DONE) {
         var obj = JSON.parse(requestIssues[index].responseText);
         issuesList.push.apply(issuesList, obj);
         requestCount++;
         if (requestsTotal == requestCount) storeIssues();
       }
     };
   }(i);
   requestIssues[i].open('GET', api, true);
   requestIssues[i].send(null);
  }
}

var searchIssues = function(domain, tab){
  console.log(domain);
  var count = 0;
  for (var i = 0; i < issuesList.length; i++) {
   var str = issuesList[i].body.toString();
   if (str.indexOf(domain) !== -1){
     count++;
   }
   console.log(count);
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
      getIssuesCount(); // if nothing in storage fetch the list from github
    } else {
      issuesList = item.issuesList;
      tsRefresh = item.tsRefresh;
      console.log('Issues loaded from storage.');
      checkRefresh();
    }
  }
}
chrome.runtime.onMessage.addListener(handleMessage);
chrome.browserAction.setBadgeBackgroundColor({ color: [64, 64, 64, 255] });
chrome.storage.local.get(storageCheck);
