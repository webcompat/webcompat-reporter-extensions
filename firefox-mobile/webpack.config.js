/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// webpack config to bundle the Firefox for Android web extension from shared sources.

const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./firefox-mobile/addon.js",
  output: {
    filename: "./dist/firefox-mobile/background.js"
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: "shared/content.js"
        // to: defaults to output directory
      },
      {
        from: "shared/*.png",
        to: "./dist/firefox-mobile/[name].[ext]"
      },
      {
        from: "./firefox-mobile/manifest.json",
        to: "./dist/firefox-mobile/manifest.json",
        transform: function(content, path) {
          // Add Firefox-specific bits to the manifest.json
          let manifest = JSON.parse(content);
          manifest["applications"] = {
            gecko: {
              id: "webcompat-reporter-for-mobile@webcompat.com",
              strict_min_version: "51.0"
            }
          };
          return JSON.stringify(manifest, null, 2);
        }
      }
    ])
  ]
};
