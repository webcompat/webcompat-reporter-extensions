/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import initAddon from "../shared/base.js";

const REPORTER_ID = "addon-reporter-chrome";

initAddon(REPORTER_ID, { createContextMenu: true });
