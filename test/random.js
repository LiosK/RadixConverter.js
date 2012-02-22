"use strict";

module("random number tests for popular numeral systems");

function createPopularSystems(list) {
  var digits = "0123456789abcdefghijklmnopqrstuvwxyz";
  for (var i = 0, len = digits.length; i < len; ++i) {
    list[i + 1] = list[i].concat(digits.charAt(i));
  }
  return list;
}

function getRandomInt(x) {
  if (x <   0) return NaN;
  if (x <= 30) return (0 | Math.random() * (1 <<      x));
  if (x <= 53) return (0 | Math.random() * (1 <<     30))
                    + (0 | Math.random() * (1 << x - 30)) * (1 << 30);
  return NaN;
}

function pad(str, length) {
  var i = length - str.length, z = "0";
  for (; i > 0; i >>>= 1, z += z) { if (i & 1) { str = z + str; } }
  return str;
}

test("53-bit random number tests", function() {
  var strSys = createPopularSystems([""]), arrSys = createPopularSystems([[]]);
  var len = strSys.length, nnums = 2;
  expect((len - 2) * (len - 2) * nnums * 5);

  for (var i = 2; i < len; ++i) {
    for (var j = 2; j < len; ++j) {
      var ii = new RadixConverter(i, j);
      var ss = new RadixConverter(strSys[i], strSys[j]);
      var as = new RadixConverter(arrSys[i], strSys[j]);
      var aa = new RadixConverter(arrSys[i], arrSys[j]);
      var sa = new RadixConverter(strSys[i], arrSys[j]);
      for (var k = 0; k < nnums; ++k) {
        var num = getRandomInt(53);
        var x = num.toString(i), y = num.toString(j), ax = x.split(""), ay = y.split("");
         equal(    ii.convert( x),  y, "str: " + x + "(" + i + ") -> str: " + y + "(" + j + ")");
         equal(    ss.convert( x),  y, "str: " + x + "(" + i + ") -> str: " + y + "(" + j + ")");
         equal(    as.convert(ax),  y, "arr: " + x + "(" + i + ") -> str: " + y + "(" + j + ")");
         deepEqual(aa.convert(ax), ay, "arr: " + x + "(" + i + ") -> arr: " + y + "(" + j + ")");
         deepEqual(sa.convert( x), ay, "str: " + x + "(" + i + ") -> arr: " + y + "(" + j + ")");
      }
    }
  }
});

test("longer random number tests", function() {
  var strSys = createPopularSystems([""]), arrSys = createPopularSystems([[]]);
  var len = strSys.length, nnums = 4, intmax = Math.pow(2, 53), nstretch = 5;
  expect(265 * nnums);

  for (var i = 2; i < len; ++i) {
    for (var j = i; j < len; j *= i) {
      var jdigit = Math.floor(Math.log(intmax) / Math.log(j));
      var base = Math.pow(j, jdigit), idigit = Math.round(Math.log(base) / Math.log(i));

      var ii = new RadixConverter(i, j);
      var ss = new RadixConverter(strSys[i], strSys[j]);
      var as = new RadixConverter(arrSys[i], strSys[j]);
      var aa = new RadixConverter(arrSys[i], arrSys[j]);
      var sa = new RadixConverter(strSys[i], arrSys[j]);
      var fii = new RadixConverter(j, i);
      var fss = new RadixConverter(strSys[j], strSys[i]);
      var fas = new RadixConverter(arrSys[j], strSys[i]);
      var faa = new RadixConverter(arrSys[j], arrSys[i]);
      var fsa = new RadixConverter(strSys[j], arrSys[i]);

      for (var k = 0; k < nnums; ++k) {
        var x = "", y = "";
        for (var l = 0; l < nstretch; ++l) {
          var num = getRandomInt(53) % base;
          x += pad(num.toString(i), idigit);
          y += pad(num.toString(j), jdigit);
        }
        x = x.replace(/^0+/, "");
        y = y.replace(/^0+/, "");
        var ax = x.split(""), ay = y.split("");
        equal(    ii.convert( x),  y, "str: " + x + "(" + i + ") -> str: " + y + "(" + j + ")");
        equal(    ss.convert( x),  y, "str: " + x + "(" + i + ") -> str: " + y + "(" + j + ")");
        equal(    as.convert(ax),  y, "arr: " + x + "(" + i + ") -> str: " + y + "(" + j + ")");
        deepEqual(aa.convert(ax), ay, "arr: " + x + "(" + i + ") -> arr: " + y + "(" + j + ")");
        deepEqual(sa.convert( x), ay, "str: " + x + "(" + i + ") -> arr: " + y + "(" + j + ")");
        if (i !== j) {  // flipped test
          equal(    fii.convert( y),  x, "str: " + y + "(" + j + ") -> str: " + x + "(" + i + ")");
          equal(    fss.convert( y),  x, "str: " + y + "(" + j + ") -> str: " + x + "(" + i + ")");
          equal(    fas.convert(ay),  x, "arr: " + y + "(" + j + ") -> str: " + x + "(" + i + ")");
          deepEqual(faa.convert(ay), ax, "arr: " + y + "(" + j + ") -> arr: " + x + "(" + i + ")");
          deepEqual(fsa.convert( y), ax, "str: " + y + "(" + j + ") -> arr: " + x + "(" + i + ")");
        }
      }
    }
  }
});

// vim: et ts=2 sw=2
