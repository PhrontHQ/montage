  /*global require,exports,describe,it,expect */
describe("require-spec", function () {

  beforeEach(function () {
    /* ... Set up your object ... */
  });

  afterEach(function () {
    /* ... Tear it down ... */
  });

  //
  it("load core module", function () {
    var montageRequire = require("mod/core/core");
    expect(typeof montageRequire.Montage).toEqual("function");
  });

  it("load alias module", function () {
    var montageRequire = require("mod");
    expect(typeof montageRequire.Montage).toEqual("function");
  });

  it("load inject module", function () {
    var URL = require("mod/core/mini-url");
    expect(typeof URL.resolve).toEqual("function");
  });

  it("load test-controller module", function () {
    var TestController = require('mod-testing/test-controller').TestController;
    expect(typeof TestController).toEqual("function");
  });

});
