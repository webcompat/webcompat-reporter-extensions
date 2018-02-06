/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// webpack config to bundle the Opera web extension from shared sources.

const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./opera/addon.js",
  output: {
    filename: "./dist/opera/background.js"
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: "shared/content.js"
        // to: defaults to output directory
      },
      {
        from: "shared/*.png",
        to: "./dist/opera/[name].[ext]"
      },
      {
        from: "shared/manifest.json",
        to: "./dist/opera/[name].json"
      }
    ])
  ]
};
