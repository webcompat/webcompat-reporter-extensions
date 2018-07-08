/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

import fileExists from "file-exists";
import helpers from "./lib/helpers.js";
import shell from "shelljs";

const { registerSuite } = intern.getInterface("object");
const { assert } = intern.getPlugin("chai");

registerSuite("dist output", {
  before() {
    shell.rm("-rf", "dist/");
    return helpers.compileWebpack();
  },
  tests: {
    "has shared output (single files)"() {
      // verify single file dist assets got added
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
            assert.isTrue(
              exists,
              "all shared single-file assets are included in dist output"
            )
          );
        });
      });
    },
    "has _locales directory with all l18n message files"() {
      // verify localization directory dist asset was added
      ["chrome", "opera", "firefox-mobile", "firefox"].forEach(browser => {
        ["en"].forEach(lang => {
          fileExists(
            `dist/${browser}/_locales/${lang}/messages.json`,
            (err, exists) =>
              assert.isTrue(
                exists,
                "locales directory with all current translations is included in dist output"
              )
          );
        });
      });
    }
  }
});
