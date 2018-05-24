/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// webpack config file to bundle the web extensions from shared sources

const CopyWebpackPlugin = require("copy-webpack-plugin");
const version = require("../package.json").version;

module.exports = function(env) {
  // Get extension platform from webpack env variable. (Can be set to any string.)
  var config = {
    entry: `./${env}/addon.js`,
    output: {
      filename: `../dist/${env}/background.js`
    },
    plugins: [
      new CopyWebpackPlugin([
        {
          from: "shared/content.js",
          to: `../dist/${env}/content.js`
        },
        {
          from: "shared/*.png",
          to: `../dist/${env}/[name].[ext]`
        },
        {
          from: "shared/manifest.json",
          to: `../dist/${env}/[name].json`,
          transform: function(content, path) {
            let manifest = JSON.parse(content);
            // Derive addon versioning from package.json
            manifest["version"] = version;
            switch (env) {
              case "firefox":
                // Add Firefox-specific bits to the manifest.json
                manifest["applications"] = {
                  gecko: {
                    id: "jid1-mjpB54bRzP9Zxw@jetpack",
                    strict_min_version: "49.0a1"
                  }
                };
                return JSON.stringify(manifest, null, 2);
              case "firefox-mobile":
                // Add Firefox-mobile-specific bits to the manifest.json
                manifest["applications"] = {
                  gecko: {
                    id: "webcompat-reporter-for-mobile@webcompat.com",
                    strict_min_version: "51.0"
                  }
                };
                return JSON.stringify(manifest, null, 2);
              default:
                // Neither Chrome nor Opera needs the applications key
                return JSON.stringify(manifest, null, 2);
            }
          }
        }
      ])
    ]
  };
  return config;
};
