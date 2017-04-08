# Webcompat.com Reporter browser extensions

Browser extensions for Chrome, Firefox (29+), Opera, and Safari that allow users to click on a button in the browser chrome to report a web compatibility issue at webcompat.com.

*(If someone knows how to build something similar for Internet Explorer, please file an issue)

![Screenshots of browsers with installed extension](screenshots.jpg)

### Installation

Find the packaged extension in the `bin` directory, and install in your browser (usually double-clicking or dropping into a browser window does the trick).

Links to extension sites coming soon.

### Linting

Before you commit your code please run the npm run-script `eslint` in order to ensure that it is linted accordingly to the lint rules followed across the repository. To know more about the command please type

```shell
npm run eslint --info
```

### Bookmarklet

Another way to easily report issues is via a [bookmarklet](http://en.wikipedia.org/wiki/Bookmarklet). Make one of those however you make them normally, and copy and paste the following code:

```
javascript:(function(){location.href="http://webcompat.com/?open=1&url="+encodeURIComponent(location.href)}())
```

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
