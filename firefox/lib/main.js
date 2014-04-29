/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let tabs = require("sdk/tabs");
let buttons = require('sdk/ui/button/action');
let prefix = "http://webcompat.com/?open=1&url=";

function sendURL(state) {
  tabs.open(prefix + encodeURIComponent(tabs.activeTab.url));
}

var button = buttons.ActionButton({
  id: "webcompat-reporter",
  label: "Click to report an incompatible site at webcompat.com.",
  icon: {
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onClick: sendURL
});
