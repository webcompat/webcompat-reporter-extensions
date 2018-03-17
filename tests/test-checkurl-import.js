/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

import isReportableURL from "../shared/checkurl.js";

const { registerSuite } = intern.getInterface("object");
const { assert } = intern.getPlugin("chai");

// const helpers = require("./lib/helpers");
// const shell = require("shelljs");

registerSuite("isReportableURL module", {
  before() {
    // return helpers.compileWebpack();
  },
  tests: {
    "isReportableURL imported successfully"() {
      // Verify that isReportableURL function is imported correctly.
      assert.exists(
        isReportableURL,
        "isReportableURL is neither 'null' nor 'undefined'"
      );
    },
    "isReportableURL is a function"() {
      // Verify that isReportableURL is recognized as a function.
      assert.isFunction(isReportableURL, "isReportableURL is a function");
    },
    "calling isReportableURL does not throw an error"() {
      // Verify that calling isReportableURL does not throw an error.
      assert.doesNotThrow(isReportableURL, Error);
    }
  }
});
