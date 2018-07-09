/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const version = require("../../package.json").version;

/*
  Returns a promise that resolves once webpack has compiled all the addon
  configs have been built.
*/

function compileWebpack() {
  return new Promise((resolve, reject) => {
    const config = ["chrome", "firefox", "firefox-mobile", "opera"].map(
      platform => {
        var template = {
          entry: `./${platform}/addon.js`,
          output: {
            filename: `../dist/${platform}/background.js`
          },
          plugins: [
            new CopyWebpackPlugin([
              {
                from: "shared/_locales/",
                to: `../dist/${platform}/_locales/`
              },
              {
                from: "shared/content.js",
                to: `../dist/${platform}/content.js`
              },
              {
                from: "shared/*.png",
                to: `../dist/${platform}/[name].[ext]`
              },
              {
                from: "shared/manifest.json",
                to: `../dist/${platform}/[name].json`,
                transform: function(content, path) {
                  let manifest = JSON.parse(content);
                  // Derive addon versioning from package.json
                  manifest["version"] = version;
                  switch (platform) {
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
        return template;
      }
    );
    const compiler = webpack(config);
    compiler.run((err, stats) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

module.exports = {
  compileWebpack
};
