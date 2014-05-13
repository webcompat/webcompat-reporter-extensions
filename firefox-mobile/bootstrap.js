const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");

let menuItem, tab, url;
let prefix = "http://webcompat.com/?open=1&url=";

function reportIssue(window) {
  url = encodeURIComponent(window.BrowserApp.selectedTab.browser.currentURI.spec);
  tab = window.BrowserApp.addTab(prefix + url);
}

function loadIntoWindow(window) {
  if (!window)
    return;

  menuItem = window.NativeWindow.menu.add({
    name: "Report Site Issue",
    icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADUUlEQVR42sVXXU/TYBjlJ/injAoCguD8QmNUYrwxaiRRE/VC77xSb4x6YdRoYkQDEYOK4hc6cAxlIEScAgobH7KWbmu7tsfndDU0JCau3fQkT/I2a/ec9/k4z/tWKQNb1oj1iuEfWy99V4Vy3t8ktjkUiarSP4qI00Zk3m5AZqCJz7KugRKt57pkEqURoLPoJqjvt0GfaYedn4Gtp2HO90AdakXmXS3fqRwB7lx5vx1WbhKrYZsLUOP7oAjByhHg7mMtyH+7jPzkNRiznShkhgDHAaHPdiDTt5ZRqAABFltsJ4x0NwrKEGyJgp3/AUv7IiTiMBdeQJ++yXf4biUINEId3OM6Nxdfw0h1wZx7KutXRULZr7CNeWTHzkgt1FQmAmpslzj7ILuflt1/h5VNwlISRULpRxKF59ASR1ioFSIwuFscddGk8p+J4zew1FG3E5yCAsdcgjZ6kt1QmRQwAsy9Y2niNIWCmnALMZe8BG3kmOR/hzivr1ARRuuw/PEgPEj+n0jVt6OwFJOuuApL+yw2gez4OQpTuQlE2F5S5Td8BLrhGHPFdfqhRCUHwlLiQmC9fNNcPgIZyqyE3zEzIBwrK7u/T/kBUfgZlVaM4Teyn055JCLlINBM3XcL7jcsdVieX66ooLEIPdWx8qzPQh3Yikx/Q1gCDP06t8j8YMtRhPzQZx+4neCBXcIohCPgDp74Xi+/HmRNAqtBfbBEkPzIjp+VrqgOToA7MFKd8IOql5s4L3nvg0mb6ynK8Mw95Keuwwd2hSdKzaUToPBw8tnmIvyg8BSWBoTAO2RFdPQfd0V8jnMmCJnHkDzADy3RRmEqmYB8VAdt+Aj+BKqePn3LnYb699v+X+ADJyeLOAiBjdJOpxEWJOe1ZAACY+UgcCcogVosJ44iLHLfrpBAkCJsFPVrkVwrCANt9ESgIvROu9XujA8KHlqVfrZgUwACXicsDx8CHDtY+JMXvA6IBJdi5o+tVCIYORYyRSj8NOQucsmLriT/DYxUB88PrKPw09BPQo23uspn56Y4kr1x7EiGdPeEZMghRRtp47tU0tDjeHU6eC9gSvjnQmY/60PsMNQPB0S2I3Rc0nmQFuByGilWdbSBBxUaiQW9pPb+9+v5L/5IMZ9vMn5CAAAAAElFTkSuQmCC",
    callback: () => reportIssue(window)
  });
}

function unloadFromWindow(window) {
  if (!window)
    return;

  window.NativeWindow.menu.remove(menuItem);
  menuItem = null;
}


/**
 * bootstrap.js API
 */
var windowListener = {
  onOpenWindow: function(aWindow) {
    // Wait for the window to finish loading
    let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor)
                    .getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
    domWindow.addEventListener("load", function() {
      domWindow.removeEventListener("load", arguments.callee, false);
      loadIntoWindow(domWindow);
    }, false);
  },

  onCloseWindow: function(aWindow) {
  },

  onWindowTitleChange: function(aWindow, aTitle) {
  }
};

function startup(aData, aReason) {
  // Load into any existing windows
  let windows = Services.wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    loadIntoWindow(domWindow);
  }

  // Load into any new windows
  Services.wm.addListener(windowListener);
}

function shutdown(aData, aReason) {
  // When the application is shutting down we normally don't have to clean
  // up any UI changes made
  if (aReason == APP_SHUTDOWN)
    return;

  // Stop listening for new windows
  Services.wm.removeListener(windowListener);

  // Unload from any existing windows
  let windows = Services.wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    unloadFromWindow(domWindow);
  }
}

function install(aData, aReason) {
}

function uninstall(aData, aReason) {
}
