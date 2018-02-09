/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import initAddon from "../shared/base.js";

const REPORTER_ID = "addon-reporter-firefox-mobile";

browser.runtime.getBrowserInfo().then(function({ version }) {
  if (version.includes("a")) {
    // Uninstall, without prompts, because this addon makes no sense on Nightly
    // (it's built-in by default)
    browser.management.uninstallSelf();
  } else {
    // Proceed if we're not running on Nightly.
    // Note: Fennec doesn't support context menu APIs
    initAddon(REPORTER_ID, { createContextMenu: false });
  }
});
