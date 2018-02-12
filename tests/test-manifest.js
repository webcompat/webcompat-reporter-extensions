/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const { registerSuite } = intern.getInterface("object");
const { assert } = intern.getPlugin("chai");

const helpers = require("./lib/helpers");
const shell = require("shelljs");

registerSuite("manifest.json creation", {
  before() {
    shell.rm("-rf", "dist/");
    return helpers.compileWebpack();
  },
  tests: {
    "has shared keys"() {
      // verify that shared manifest bits ended up where they should be.
      ["chrome", "opera", "firefox", "firefox-mobile"].forEach(browser => {
        let manifest = require(`../dist/${browser}/manifest.json`);
        assert.containsAllKeys(
          manifest,
          [
            "manifest_version",
            "name",
            "description",
            "background",
            "content_scripts",
            "permissions",
            "icons",
            "browser_action"
          ],
          "generated manifest.json has all expected shared keys"
        );
      });
    },

    "has version number"() {
      // all browsers get a version key added.
      ["chrome", "opera", "firefox", "firefox-mobile"].forEach(browser => {
        let manifest = require(`../dist/${browser}/manifest.json`);
        assert.containsAllKeys(
          manifest,
          ["version"],
          "generated manifest.json has a version key"
        );
        assert.isString(manifest["version"], "version key is a string");
        assert.isNumber(
          parseFloat(manifest["version"]),
          "version key is a string that can be parsed as a number"
        );
      });
    },

    "has application keys"() {
      // firefox browsers get an applications key added.
      ["firefox", "firefox-mobile"].forEach(browser => {
        let manifest = require(`../dist/${browser}/manifest.json`);
        assert.containsAllKeys(
          manifest,
          ["applications"],
          "generated manifest.json has an applications key"
        );
        assert.isObject(
          manifest["applications"],
          "applications key object exists"
        );
      });
    }
  }
});
