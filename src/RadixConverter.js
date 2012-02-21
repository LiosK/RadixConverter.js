/**
 * RadixConverter.js: A generalized radix converter for unsigned integers.
 *
 * @fileOverview
 * @author  LiosK
 * @version 1.1 beta
 * @license The MIT License: Copyright (c) 2012 LiosK.
 */

"use strict";

/**
 * @constructor
 * @param {int|string|string[]} [ipSymbols = RadixConverter.DECIMAL_SYMBOLS]
 * @param {int|string|string[]} [opSymbols = RadixConverter.DECIMAL_SYMBOLS]
 * @throws {Error}
 */
var RadixConverter;

RadixConverter = (function() {

  /** @lends RadixConverter */
  function RadixConverter(ipSymbols, opSymbols) {
    var defaultSymbols = RadixConverter.DECIMAL_SYMBOLS;
    this.ipSymbols((ipSymbols == null) ? defaultSymbols : ipSymbols);
    this.opSymbols((opSymbols == null) ? defaultSymbols : opSymbols);
  }

  /**
   * @param {int} radix an integer ranging from 2 to 36
   * @returns {string}
   */
  RadixConverter.getPopularSystem = function(radix) {
    radix = Math.floor(radix || 0);
    if ((radix < 2) || (radix > 36)) {
      return null;
    } else {
      return ("0123456789abcdefghijklmnopqrstuvwxyz").substring(0, radix);
    }
  };

  /** @constant */
  RadixConverter.DECIMAL_SYMBOLS = RadixConverter.getPopularSystem(10);

  /**
   * @param {int|string|string[]}
   * @throws {Error}
   */
  RadixConverter.prototype.ipSymbols = function(x) {
    if (x == null) { return this._ipSymbols; }

    if (typeof x === "number") {
      x = RadixConverter.getPopularSystem(x);
      if (x == null) {
        throw new Error("invalid argument: invalid radix number for ipSymbols.");
      }
    }

    if (x.length > 0x8000) {
      throw new Error("invalid argument: too much symbols in ipSymbols.");
    }

    var ipMap = new (function NaiveAssoc() {
      var PREF = "assoc_";
      this.get = function(k) { return this[PREF + k]; };
      this.set = function(k, v) { this[PREF + k] = v; };
      this.exists = function(k) { return (PREF + k) in this; };
    })();

    for (var i = 0, len = x.length; i < len; ++i) {
      if (ipMap.exists(x[i])) {
        throw new Error("invalid argument: duplicate symbols in ipSymbols.");
      }
      ipMap.set(x[i], i);
    }

    /** @type int|string|string[] */
    this._ipSymbols = x;
    /** @type assoc */
    this._ipMap = ipMap;

    return this;
  };

  /**
   * @returns {int}
   */
  RadixConverter.prototype.ipRadix = function() {
    return this._ipSymbols.length;
  };

  /**
   * @param {int|string|string[]}
   * @throws {Error}
   */
  RadixConverter.prototype.opSymbols = function(x) {
    if (x == null) { return this._opSymbols; }

    if (typeof x === "number") {
      x = RadixConverter.getPopularSystem(x);
      if (x == null) {
        throw new Error("invalid argument: invalid radix number for opSymbols.");
      }
    }

    if (x.length > 0x8000) {
      throw new Error("invalid argument: too much symbols in opSymbols.");
    }

    /** @type int|string|string[] */
    this._opSymbols = x;

    return this;
  };

  /**
   * @returns {int}
   */
  RadixConverter.prototype.opRadix = function() {
    return this._opSymbols.length;
  };

  /**
   * @param {string|string[]} ip sequence of digits (most significant first)
   * @returns {string|string[]} sequence of digits (most significant first)
   * @throws {Error}
   */
  RadixConverter.prototype.convert = function(ip) {
    var ns = this._inputToInternal(ip), nlen = ns.length;
    var opSymbols = this.opSymbols(), opRadix = this.opRadix();

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
    var ipRadix = this.ipRadix();

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
