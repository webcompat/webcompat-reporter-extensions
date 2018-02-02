/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as _ from "../../shared/helpers.js";

const REPORTER_ID = "addon-reporter-firefox";

_.createContextMenu();
_.setupListeners(REPORTER_ID);
