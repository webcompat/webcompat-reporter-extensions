/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let buttons = require("sdk/ui/button/action");
let pageMod = require('sdk/page-mod')
let tabs = require("sdk/tabs");
let tabUtils = require("sdk/tabs/utils");
let { viewFor } = require("sdk/view/core");

const DOMAIN = "https://webcompat.com/";
const GET_ARGS = "?open=1&url=";

function sendURL() {
  var tab = tabs.activeTab;
  var url = tab.url;
  var screenshotData;

  if (isReportableUrl(url)) {
    screenshotData = getTabScreenshot(tab);
    tabs.open({
      url: DOMAIN + GET_ARGS + encodeURIComponent(url),
      onOpen: function onOpen(tab) {
        pageMod.PageMod({
          include: [DOMAIN + '*'],
          contentScript: 'window.postMessage("' + screenshotData + '", "*")',
        });
      }
    });
  }
}

function getTabScreenshot(tab) {
  // window that was active when the button was pressed.
  var win = tabUtils.getBrowserForTab(viewFor(tab)).contentWindow;
  var dpr = win.devicePixelRatio;
  var canvas = win.document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  var x = win.document.documentElement.scrollLeft;
  var y = win.document.documentElement.scrollTop;
  var w = win.innerWidth;
  var h = win.innerHeight;
  var scaled_w;
  var scaled_h;

  function setScale(scale) {
    scaled_w = scale * w;
    scaled_h = scale * h;
    canvas.width = scaled_w;
    canvas.height = scaled_h;
    ctx.scale(scale, scale);
  }

  // TODO: if scale is bigger or equal to 2, try 2.
  setScale(dpr);
  ctx.drawWindow(win, x, y, w, h, '#ffffff');

  return canvas.toDataURL();
}

function isReportableUrl(url) {
  return url && !(url.startsWith("about") ||
                  url.startsWith("chrome") ||
                  url.startsWith("file") ||
                  url.startsWith("resource"));
}

var button = buttons.ActionButton({
  id: "webcompat-reporter",
  label: "Site Issue",
  icon: {
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onClick: sendURL
});
