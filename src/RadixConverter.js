/**
 * RadixConverter.js: A generalized radix converter for unsigned integers.
 *
 * @fileOverview
 * @author  LiosK
 * @version 1.0
 * @license The MIT License: Copyright (c) 2012 LiosK.
 */

"use strict";

/**
 * @constructor
 * @param {string|string[]} [ipSymbols = RadixConverter.DECIMAL_SYMBOLS]
 * @param {string|string[]} [opSymbols = RadixConverter.DECIMAL_SYMBOLS]
 * @throws {Error}
 */
var RadixConverter;

RadixConverter = (function() {

  /** @lends RadixConverter */
  function RadixConverter(ipSymbols, opSymbols) {
    if (ipSymbols == null) { ipSymbols = RadixConverter.DECIMAL_SYMBOLS; }
    if (opSymbols == null) { opSymbols = RadixConverter.DECIMAL_SYMBOLS; }

    /** @type string|string[] */
    this._ipSymbols = ipSymbols;
    /** @type string|string[] */
    this._opSymbols = opSymbols;

    var ipRadix = ipSymbols.length, opRadix = opSymbols.length;
    if (0x8000 < ipRadix) {
      throw new Error("invalid argument: too much symbols in ipSymbols.");
    }
    if (0x8000 < opRadix) {
      throw new Error("invalid argument: too much symbols in opSymbols.");
    }

    /** @type assoc */
    this._ipMap = new (function NaiveAssoc() {
      var PREF = "assoc_";
      this.get = function(k) { return this[PREF + k]; };
      this.set = function(k, v) { this[PREF + k] = v; };
      this.exists = function(k) { return (PREF + k) in this; };
    })();

    for (var i = 0; i < ipRadix; ++i) {
      if (this._ipMap.exists(ipSymbols[i])) {
        throw new Error("invalid argument: duplicate symbols in ipSymbols.");
      }
      this._ipMap.set(ipSymbols[i], i);
    }
  }

  /** @constant */
  RadixConverter.DECIMAL_SYMBOLS = "0123456789";

  /**
   * @param {string|string[]} ip sequence of digits (most significant first)
   * @returns {string|string[]} sequence of digits (most significant first)
   * @throws {Error}
   */
  RadixConverter.prototype.convert = function(ip) {
    var ns = this._inputToInternal(ip), nlen = ns.length;
    var opSymbols = this._opSymbols, opRadix = opSymbols.length;

    var op = [], i = nlen;
    while (i > 0) {
      var j = i, n = 0;
      while (j--) {
        n = (n << 16) + ns[j];
        if (n < 0) { n += 0x100000000; }
        ns[j] = Math.floor(n / opRadix);
        n %= opRadix;
      }
      op.unshift(opSymbols[n]);
      if (ns[i - 1] === 0) { --i; }
    }

    return (typeof opSymbols === "string") ? op.join("") : op;
  };

  /**
   * @param {string|string[]} ip sequence of digits (most significant first)
   * @returns {int16[]} sequence of 16-bit integers (least significant first)
   * @throws {Error}
   */
  RadixConverter.prototype._inputToInternal = function(ip) {
    var ipRadix = this._ipSymbols.length;

    var ns = [0], nlen = ns.length;
    for (var i = 0, len = ip.length; i < len; ++i) {
      if (!this._ipMap.exists(ip[i])) {
        throw new Error("invalid argument: unknown digit");
      }

      var j = 0, n = this._ipMap.get(ip[i]);
      while (j < nlen) {
        n += ns[j] * ipRadix;
        ns[j] = (n & 0xffff);
        n >>>= 16;
        if ((++j >= nlen) && (n > 0)) { ns[nlen++] = 0; }
      }
    }

    return ns;
  };

  return RadixConverter;

})(RadixConverter);

// vim: et ts=2 sw=2
