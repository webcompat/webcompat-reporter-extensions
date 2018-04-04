/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const { registerSuite } = intern.getInterface("object");
const { expect } = intern.getPlugin("chai");

const helpers = require("./lib/helpers");
const shell = require("shelljs");

registerSuite("reportableUrl.js creation", {
  before() {
    shell.rm("-rf", "dist/");
    return helpers.compileWebpack();
  },
  tests: {
    "checks invalid url"() {
      const url = "";
      expect(isReportableUrl(url)).to.equal(false, "unexpected value for url");
    },

    "checks valid url"() {
      const url = "www.my-domain.co";
      expect(isReportableUrl(url)).to.equal(
        "http://www.my-domain.co/",
        "unexpected value for url"
      );
      expect(isReportableUrl(url)).to.equal(
        "https://www.my-domain.co/",
        "unexpected value for url"
      );
    }
  }
});
