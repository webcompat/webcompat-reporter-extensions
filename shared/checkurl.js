/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export default function isReportableURL(url) {
  try {
    if (url && typeof url == "string") {
      return ["http:", "https:"].some(protocol => url.startsWith(protocol));
    }
  } catch (error) {
    console.log(`isReportableURL error: ${error}`);
  }

  return false;
}
