"use strict";

module("testing training examples");

(function() {

  function CaseSet(title) {
    this.title = title;
    this.cases = new Array(arguments.length - 1);
    for (var i = 1, len = arguments.length; i < len; i++) {
      this.cases[i - 1] = arguments[i];
    }
  }

  CaseSet.prototype.runTest = function() {
    var cases = this.cases;
    test(this.title, cases.length * 2, function() {
      var rc = new RadixConverter();

      for (var i = 0, len = cases.length; i < len; i++) {
        var c = cases[i];
        rc.setIpSystem(c.xsys).setOpSystem(c.ysys)
        var zero = rc.opSymbols()[0], rgt = c.yval;
        while ((zero === rgt[0]) && (rgt.length > 1)) { rgt = rgt.slice(1); }
        deepEqual(rc.convert(c.xval), rgt, c.descXtoY());

        rc.setIpSystem(c.ysys).setOpSystem(c.xsys)
        var zero = rc.opSymbols()[0], rgt = c.xval;
        while ((zero === rgt[0]) && (rgt.length > 1)) { rgt = rgt.slice(1); }
        deepEqual(rc.convert(c.yval), rgt, c.descYtoX());
      }
    });
  };

  function TestCase(xsys, xval, ysys, yval) {
    this.xsys = xsys;
    this.xval = xval;
    this.ysys = ysys;
    this.yval = yval;
  }

  TestCase.prototype.descXtoY = function() {
    return format(this.xsys) + " -> " + format(this.ysys) + ": " + format(this.xval);
  };

  TestCase.prototype.descYtoX = function() {
    return format(this.ysys) + " -> " + format(this.xsys) + ": " + format(this.yval);
  };

  function format(x) {
    var n = 16;
    if (x instanceof Array) {
      x = "[" + x.join(", ") + "]";
    } else if (typeof x === "number") {
      x = Math.floor(x).toString();
    } else {
      x = '"' + x + '"';
    }

    if (x.length < (n * 2 + 6)) {
      return x;
    } else {
      return x.substring(0, n) + " ... " + x.substring(x.length - n);
    }
  }

  // test case definitions below
  new CaseSet(
    "README examples"
    , new TestCase("0123456789", "12345678901234567890123456789012", "0123456789abcdef", "9bd30a3c645943dd1690a03a14")
    , new TestCase(10, "12345678901234567890123456789012", 16, "9bd30a3c645943dd1690a03a14")
    , new TestCase("the quickbrownfxjmpsvlazydg.", "cwm fjord veg balks nth pyx quiz.", "><+-.,[]", "<,++[-++>+<<]].>,<>><<<>.[[+,[<>+>->+-[[.[-<>[.[>.[]]")
    , new TestCase("AaBbC", "ABabC", ["Ook.", "Ook!", "Ook?"], ["Ook!", "Ook.", "Ook!", "Ook?", "Ook?", "Ook."])
    , new TestCase(["Alice", "Bob", "Carol", "Dave"], ["Bob", "Bob", "Carol", "Alice", "Dave"], "qp", "pqppqqqpp")
  ).runTest();

  new CaseSet(
    "Misc. examples"
    , new TestCase(2, "00000000", "ABCDEF", "A")
  ).runTest();

})();

// vim: et ts=2 sw=2
