/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*global safari*/

safari.self.addEventListener(
  "message",
  function(event) {
    if (event.name === "screenshot-data") {
      window.postMessage(event.message, "*");
    }
  },
  false
);

if (window === window.top && window.location.host === "webcompat.com") {
  safari.self.tab.dispatchMessage("request-screenshot", "");
}
