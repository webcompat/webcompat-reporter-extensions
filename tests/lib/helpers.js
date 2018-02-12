/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const webpack = require("webpack");

/*
  Returns a promise that resolves once webpack has compiled all the addon
  configs have been built.
*/
function compileWebpack() {
  return new Promise((resolve, reject) => {
    const configs = ["chrome", "firefox", "firefox-mobile", "opera"].map(item =>
      require(`../../${item}/webpack.config.js`)
    );
    const compiler = webpack(configs);
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
