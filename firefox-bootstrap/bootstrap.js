/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let { classes: Cc, interfaces: Ci, utils: Cu } = Components;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyModuleGetter(this, "CustomizableUI",
  "resource:///modules/CustomizableUI.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "Services",
  "resource://gre/modules/Services.jsm");

const PREF_WC_REPORTER_ENABLED = "extensions.webcompat-reporter.enabled";
const WEBCOMPAT_DOMAIN = "webcompat.com";
const WIDGET_ID = "webcompat-reporter-button";

class TabListener {
  constructor(browser) {
    this.browser = browser;
    this.addListeners();
  }

  get QueryInterface() {
    return XPCOMUtils.generateQI(["nsIWebProgressListener",
      "nsISupportsWeakReference"]);
  }

  addListeners() {
    this.browser.addProgressListener(this);
    this.browser.tabContainer.addEventListener("TabSelect",
      this.setButtonState);
  }

  removeListeners() {
    this.browser.removeProgressListener(this);
    this.browser.tabContainer.removeEventListener("TabSelect",
      this.setButtonState);
  }

  onStateChange(webProgress, request, flag, status) {
    if (flag & Ci.nsIWebProgressListener.STATE_STOP) {
      // about:new-tab loads don't have an originalURI property, but
      // have a request.name of about:document-onload-blocker
      let scheme = request.originalURI ? request.originalURI.scheme
                 : request.name;
      this.setButtonState(scheme);
    }
  }

  setButtonState(arg) {
    // Did we get here from a TabSelect event (arg = event object)
    // or manually via onStateChange (arg = string)?
    let scheme = typeof arg === "string" ? arg :
                 arg.target.linkedBrowser.currentURI.scheme;
    let button = CustomizableUI.getWidget(WIDGET_ID);
    let isInvalidScheme = ["about", "chrome", "file", "resource", "view-source"].
      some((prefix) => scheme.startsWith(prefix));

    button.disabled = isInvalidScheme;
  }
}

let windowListener = new class {
  onOpenWindow(window) {
    let win = window.QueryInterface(Ci.nsIInterfaceRequestor).
      getInterface(Ci.nsIDOMWindow);
    WebCompatReporter.loadIntoWindow(win);
  }
};

let httpRequestObserver = new class {
  constructor() {
    this.TOPIC = "http-on-modify-request";
  }

  get observerService() {
    return Cc["@mozilla.org/observer-service;1"].
      getService(Ci.nsIObserverService);
  }

  observe(subject, topic, data) {
    if (topic === this.TOPIC) {
      var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);
      if (httpChannel.originalURI.host === WEBCOMPAT_DOMAIN &&
        httpChannel.originalURI.path.startsWith("/issues/new")) {
        httpChannel.setRequestHeader("X-Reported-With", "desktop-reporter", false);
      }
    }
  }

  addObserver() {
    this.observerService.addObserver(this, this.TOPIC, false);
  }

  removeObserver() {
    this.observerService.removeObserver(this, this.TOPIC);
  }
};

let WebCompatReporter = {
  init() {
    let strings = Services.strings.createBundle(
      "chrome://webcompat-reporter/locale/webcompat.properties");

    // Create button and add it to the hamburger panel.
    CustomizableUI.createWidget({
      id: WIDGET_ID,
      label: strings.GetStringFromName("label"),
      tooltiptext: strings.GetStringFromName("tooltip"),
      onCommand: (e) => this.reportIssue(e.target.ownerDocument),
      onBeforeCreated(aDocument) {
        this._sheetURI = Services.io.newURI("chrome://webcompat-reporter/skin/lightbulb.css", null, null);
        aDocument.defaultView.QueryInterface(Ci.nsIInterfaceRequestor).
          getInterface(Ci.nsIDOMWindowUtils).loadSheet(this._sheetURI, 1);
      },
      onDestroyed(aDocument) {
        aDocument.defaultView.QueryInterface(Ci.nsIInterfaceRequestor).
          getInterface(Ci.nsIDOMWindowUtils).removeSheet(this._sheetURI, 1);
      }
    });

    CustomizableUI.addWidgetToArea(WIDGET_ID, CustomizableUI.AREA_PANEL);

    let windows = Services.wm.getEnumerator("navigator:browser");
    while (windows.hasMoreElements()) {
      let win = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
      this.loadIntoWindow(win);
    }

    Services.wm.addListener(windowListener);
  },

  uninit() {
    CustomizableUI.destroyWidget(WIDGET_ID);

    let windows = Services.wm.getEnumerator("navigator:browser");
    while (windows.hasMoreElements()) {
      let win = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
      this.unloadWindow(win);
    }

    Services.wm.removeListener(windowListener);
  },

  loadIntoWindow(win) {
    // Handle when window is already loaded (i.e., when the add-on is installed
    // by a user for the first time
    if (win.gBrowser && win.document.readyState === "complete") {
      win._webcompatReporterTabListener = new TabListener(win.gBrowser);
      this.cleanUpOnUnload(win);
    } else {
      let onLoad;
      win.addEventListener("load", onLoad = () => {
        win.removeEventListener("load", onLoad, false);
        if (win.gBrowser) {
          win._webcompatReporterTabListener = new TabListener(win.gBrowser);
          this.cleanUpOnUnload(win);
        }
      });
    }
  },

  unloadWindow(win) {
    if (win.gBrowser) {
      win._webcompatReporterTabListener.removeListeners();
      win._webcompatReporterTabListener = null;
    }
  },

  cleanUpOnUnload(win) {
    let onUnLoad;
    win.addEventListener("unload", onUnLoad = () => {
      win.removeEventListener("unload", onUnLoad);
      this.unloadWindow(win);
    });
  },

  setButtonState(e) {
    let button = CustomizableUI.getWidget(WIDGET_ID);
    let scheme = e.target.linkedBrowser.currentURI.scheme;
    let isInvalidScheme = ["about", "chrome", "file", "resource", "view-source"].
      some((prefix) => scheme.startsWith(prefix));

    button.disabled = isInvalidScheme;
  },

  openWebCompatTab(args) {
    const ACK_MESSAGE = "WebCompat:Ack";
    const SCREENSHOT_MESSAGE = "WebCompat:SendScreenshot";
    const FRAMESCRIPT = `chrome://webcompat-reporter/content/wc-frame.js?${Date.now()}`;
    let [browser, tabData] = args;

    return new Promise((resolve) => {
      let loadedListener = {
        QueryInterface: XPCOMUtils.generateQI(["nsIWebProgressListener",
          "nsISupportsWeakReference"]),
        onStateChange: function(webProgress, request, flag, status) {
          if (flag & Ci.nsIWebProgressListener.STATE_STOP) {
            if (request.originalURI && request.originalURI.host === WEBCOMPAT_DOMAIN) {
              let mm = browser.selectedBrowser.messageManager;
              browser.removeProgressListener(this);

              // did we successfully get a screenshot?
              if (tabData && tabData.canvasData) {
                mm.loadFrameScript(FRAMESCRIPT, true);
                mm.sendAsyncMessage(SCREENSHOT_MESSAGE, {
                  screenshot: tabData.canvasData
                });

                mm.addMessageListener(ACK_MESSAGE, function ackFn(message) {
                  mm.removeMessageListener(ACK_MESSAGE, ackFn);
                  resolve();
                });
              } else {
                resolve();
              }
              httpRequestObserver.removeObserver();
            }
          }
        }
      };

      httpRequestObserver.addObserver();
      browser.addProgressListener(loadedListener);
      browser.loadOneTab(
        `https://${WEBCOMPAT_DOMAIN}/issues/new?url=${encodeURIComponent(tabData.url)}`,
        {inBackground: false});
    });
  },

  getScreenshot(browser) {
    const FRAMESCRIPT = `chrome://webcompat-reporter/content/tab-frame.js?${Date.now()}`;
    const TABDATA_MESSAGE = "WebCompat:SendTabData";

    return new Promise((resolve) => {
      let mm = browser.selectedBrowser.messageManager;

      mm.loadFrameScript(FRAMESCRIPT, true);
      mm.addMessageListener(TABDATA_MESSAGE, function receiveFn(message) {
        mm.removeMessageListener(TABDATA_MESSAGE, receiveFn);
        resolve([browser, message.json]);
      });
    });
  },

  reportIssue(xulDoc) {
    Promise.resolve(xulDoc.defaultView.gBrowser).then(this.getScreenshot)
                                                .then(this.openWebCompatTab)
                                                .catch(Cu.reportError);
  }
};

// use enabled pref as a way for tests (e.g. test_contextmenu.html) to disable
// the addon when running.
let prefObserver = function(aSubject, aTopic, aData) {
  let enabled = Services.prefs.getBoolPref(PREF_WC_REPORTER_ENABLED);
  if (enabled) {
    WebCompatReporter.init();
  } else {
    WebCompatReporter.uninit();
  }
};

function startup(aData, aReason) {
  // Observe pref changes and enable/disable as necessary.
  Services.prefs.addObserver(PREF_WC_REPORTER_ENABLED, prefObserver, false);

  // temporary for add-on port, set this in all.js somewhere, probably
  Services.prefs.setBoolPref(PREF_WC_REPORTER_ENABLED, true);
  // Only initialize if pref is enabled.
  let enabled = Services.prefs.getBoolPref(PREF_WC_REPORTER_ENABLED);
  if (enabled) {
    WebCompatReporter.init();
  }
}

function shutdown(aData, aReason) {
  Services.prefs.removeObserver(PREF_WC_REPORTER_ENABLED, prefObserver);

  let enabled = Services.prefs.getBoolPref(PREF_WC_REPORTER_ENABLED);
  if (enabled) {
    WebCompatReporter.uninit();
    WebCompatReporter = null;
  }
}

function install(aData, aReason) {}
function uninstall(aData, aReason) {}
