/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const { registerSuite } = intern.getInterface("object");
const { assert } = intern.getPlugin("chai");

const fileExists = require("file-exists");
const helpers = require("./lib/helpers");

registerSuite("dist output", {
  before() {
    return helpers.compileWebpack();
  },
  tests: {
    "has shared output"() {
      // verify dist assets got added
      ["chrome", "opera", "firefox-mobile", "firefox"].forEach(browser => {
        [
          "background.js",
          "content.js",
          "icon32.png",
          "icon48.png",
          "icon64.png",
          "icon128.png",
          "manifest.json"
        ].forEach(file => {
          fileExists(`dist/${browser}/${file}`, (err, exists) =>
            assert.isTrue(exists)
          );
        });
      });
    }
  }
});
