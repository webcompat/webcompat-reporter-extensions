/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const SCREENSHOT_MESSAGE = "WebCompat:SendScreenshot";

addMessageListener(SCREENSHOT_MESSAGE, function handleMessage(message) {
  removeMessageListener(SCREENSHOT_MESSAGE, handleMessage);
  // waive x-rays so event.message.origin is non-empty on the receiving side.
  // see https://github.com/webcompat/webcompat.com/blob/0c5f5117fb14cd4777aa68a861cd8126d64c3c59/webcompat/static/js/lib/bugform.js#L81
  let win = Components.utils.waiveXrays(content);
  win.postMessage(message.data.screenshot, "https://webcompat.com");

  sendAsyncMessage("WebCompat:Ack");
});
