/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// webpack config to bundle the Opera web extension from shared sources.

const CopyWebpackPlugin = require("copy-webpack-plugin");
const version = require("../package.json").version;

module.exports = {
  entry: "./opera/addon.js",
  output: {
    filename: "./dist/opera/background.js"
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: "shared/content.js",
        to: "./dist/opera/content.js"
      },
      {
        from: "shared/*.png",
        to: "./dist/opera/[name].[ext]"
      },
      {
        from: "shared/manifest.json",
        to: "./dist/opera/[name].json",
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
