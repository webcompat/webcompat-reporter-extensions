/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

import isReportableURL from "../shared/checkurl.js";
import helpers from "./lib/helpers.js";
import shell from "shelljs";

const { registerSuite } = intern.getInterface("object");
const { assert } = intern.getPlugin("chai");

registerSuite("isReportableURL module", {
  before() {
    shell.rm("-rf", "dist/");
    return helpers.compileWebpack();
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
    },
    "calling isReportableURL with valid protocols will return true"() {
      // Verify that calling isReportableURL with valid protocol returns true.
      let httpUrl = "http://somewebsiteaddress.com";
      let httpsUrl = "https://anotherwebsite.org";
      assert.isTrue(
        isReportableURL(httpUrl),
        "'http:' is a reportable URL protocol"
      );
      assert.isTrue(
        isReportableURL(httpsUrl),
        "'https:' is a reportable URL protocol"
      );
    },
    "calling isReportableURL with invalid protocols will not return true"() {
      // Verify that calling isReportableURL with invalid protocol does not return true.
      let guacUrl = "guacamole://yumavocados.com";
      let ftpUrl = "ftp://downloadfreetacos.com";
      let badHttpUrl = "http//sitenotloading.org";
      let noProtUrl = "www.missingsomething.com";
      assert.isNotTrue(
        isReportableURL(guacUrl),
        "'guacamole' is not a reportable URL protocol"
      );
      assert.isNotTrue(
        isReportableURL(ftpUrl),
        "'ftp:' is not a reportable URL protocol"
      );
      assert.isNotTrue(
        isReportableURL(badHttpUrl),
        "'http' without a colon is not a reportable URL protocol"
      );
      assert.isNotTrue(
        isReportableURL(noProtUrl),
        "missing protocol means not a reportable URL"
      );
    }
  }
});
