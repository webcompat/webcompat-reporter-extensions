/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const TABDATA_MESSAGE = "WebCompat:SendTabData";
let win = content;

let getScreenshot = function(win) {
  let url = win.location.href;
  try {
    let dpr = win.devicePixelRatio;
    let canvas = win.document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    let x = win.document.documentElement.scrollLeft;
    let y = win.document.documentElement.scrollTop;
    let w = win.innerWidth;
    let h = win.innerHeight;
    canvas.width = dpr * w;
    canvas.height = dpr * h;
    ctx.scale(dpr, dpr);
    ctx.drawWindow(win, x, y, w, h, "#fff");
    let canvasData = canvas.toDataURL();
    canvas = null;
    return [url, canvasData];
  } catch (e) {
    // CanvasRenderingContext2D.drawWindow can fail depending on memory or
    // surface size. Rather than fail, return the URL so the user can continue
    // to file an issue without a screenshot.
    Components.utils.reportError(`WebCompatReporter: getting a screenshot failed: ${e}`);
    return [url];
  }
};

// we only care about top level docs
if (win.location.href === win.top.location.href) {
  let [url, canvasData] = getScreenshot(win);
  sendAsyncMessage(TABDATA_MESSAGE, {url: url, canvasData: canvasData});
}
