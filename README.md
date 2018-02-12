# Webcompat.com Reporter browser extensions

[![Build Status](https://travis-ci.org/webcompat/webcompat-reporter-extensions.svg?branch=master)](https://travis-ci.org/webcompat/webcompat-reporter-extensions)

Browser extensions for Chrome, Firefox, Opera, and Safari that allow users to click on a button in the browser chrome to report a web compatibility issue at webcompat.com.

*(If someone knows how to build something similar for Internet Explorer, please file an issue)

![Screenshots of browsers with installed extension](screenshots.jpg)

### Installation

Find the packaged extension in the `bin` directory, and install in your browser (usually double-clicking or dropping into a browser window does the trick).

Links to extension sites coming soon.

### Bookmarklet

Another way to easily report issues is via a [bookmarklet](http://en.wikipedia.org/wiki/Bookmarklet). Make one of those however you make them normally, and copy and paste the following code:

```
javascript:(function(){location.href="http://webcompat.com/?open=1&url="+encodeURIComponent(location.href)}())
```

### Building

To build the Firefox, Chrome and Opera web extension addons, first, install npm dependencies by running the following command from the project root:

`npm install`

The following commands will build the addons, so they can be packaged for testing or distribution:

```
npm run build:firefox
npm run build:fennec
npm run build:chrome
npm run build:opera
```

The following commands will run the addons in their target browser:

```
npm run firefox
```

To run the addon in Firefox for Android, use the following commands:

```
npm run fennec
npm run fennec-nightly
```

Note: it's necessary to pass the device ID as an argument for these commands:

```
$ adb devices
> ABCDEFGHIJKLMNOP
# Note the double dashes, they're required.
$ npm run fennec -- --android-device=ABCDEFGHIJKLMNOP
$ npm run fennec-nightly -- --android-device=ABCDEFGHIJKLMNOP
````

### Running tests

Tests can be run with by running the following npm script:

`npm run test`

### Privacy

By clicking on the extension button, the user asks the browser to send the URL of a website to webcompat.com (in order to report an issue) in a new tab. No information is collected besides that which gets submitted by the user as a bug report.

If you choose to upload a screenshot or other image, it will be publicly accessible. Please do not include any confidential or personal information in the screenshot.

The User Agent HTTP header that your browser sends will be recorded in the bug report, if you choose to report a bug, but is hidden by default.


### License

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.

Icons derived from work licensed under Creative Commons Attribution:

* Light Bulb by Jean-Philippe Cabaroc from The Noun Project
