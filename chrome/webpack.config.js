/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// webpack config to bundle the Chrome web extension from shared sources.

const CopyWebpackPlugin = require("copy-webpack-plugin");
const version = require("../package.json").version;

module.exports = {
  entry: "./chrome/addon.js",
  output: {
    filename: "../dist/chrome/background.js"
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: "shared/_locales/en/messages.json",
        to: "../dist/chrome/_locales/en/messages.json"
      },
      {
        from: "shared/_locales/it/messages.json",
        to: "../dist/chrome/_locales/it/messages.json"
      },
      {
        from: "shared/content.js",
        to: "../dist/chrome/content.js"
      },
      {
        from: "shared/*.png",
        to: "../dist/chrome/[name].[ext]"
      },
      {
        from: "shared/manifest.json",
        to: "../dist/chrome/[name].json",
        transform: function(content, path) {
          let manifest = JSON.parse(content);
          // Derive addon versioning from package.json
          manifest["version"] = version;
          return JSON.stringify(manifest, null, 2);
        }
      }
    ])
  ]
};
