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
 * @param {int|string|string[]} [ipSystem = 10]
 * @param {int|string|string[]} [opSystem = 10]
 * @throws {Error}
 */
var RadixConverter;

RadixConverter = (function() {

  /** @lends RadixConverter */
  function RadixConverter(ipSystem, opSystem) {
    this.setIpSystem((ipSystem == null) ? 10 : ipSystem);
    this.setOpSystem((opSystem == null) ? 10 : opSystem);
  }

  /**
   * Returns the popular numeral system for the given radix.
   *
   * @param {int} radix An integer ranging from 2 to 36.
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

  /**
   * Sets up the input numeral system.
   *
   * @param {int|string|string[]} sys
   * @returns {RadixConverter} this.
   * @throws {Error}
   */
  RadixConverter.prototype.setIpSystem = function(sys) {
    if (typeof sys === "number") {
      sys = RadixConverter.getPopularSystem(sys);
      if (sys == null) {
        throw new Error("invalid argument: invalid radix number for ipSystem.");
      }
    }

    if (sys.length < 2) {
      throw new Error("invalid argument: less than two symbols in ipSystem.");
    }

    if (sys.length > 0x8000) {
      throw new Error("invalid argument: too many symbols in ipSystem.");
    }

    var ipMap = new (function NaiveAssoc() {
      var PREF = "assoc_";
      this.get = function(k) { return this[PREF + k]; };
      this.set = function(k, v) { this[PREF + k] = v; };
      this.exists = function(k) { return (PREF + k) in this; };
    })();

    for (var i = 0, len = sys.length; i < len; ++i) {
      if (ipMap.exists(sys[i])) {
        throw new Error("invalid argument: duplicate symbols in ipSystem.");
      }
      ipMap.set(sys[i], i);
    }

    /** @type string|string[] */
    this._ipSymbols = sys;
    /** @type assoc */
    this._ipMap = ipMap;

    return this;
  };

  /**
   * Returns the symbol list of the input numeral system.
   *
   * @returns {string|string[]}
   */
  RadixConverter.prototype.ipSymbols = function() {
    return this._ipSymbols;
  };

  /**
   * Returns the radix of the input numeral system.
   *
   * @returns {int}
   */
  RadixConverter.prototype.ipRadix = function() {
    return this._ipSymbols.length;
  };

  /**
   * Sets up the output numeral system.
   *
   * @param {int|string|string[]} sys
   * @returns {RadixConverter} this.
   * @throws {Error}
   */
  RadixConverter.prototype.setOpSystem = function(sys) {
    if (typeof sys === "number") {
      sys = RadixConverter.getPopularSystem(sys);
      if (sys == null) {
        throw new Error("invalid argument: invalid radix number for opSystem.");
      }
    }

    if (sys.length < 2) {
      throw new Error("invalid argument: less than two symbols in opSystem.");
    }

    if (sys.length > 0x8000) {
      throw new Error("invalid argument: too many symbols in opSystem.");
    }

    /** @type string|string[] */
    this._opSymbols = sys;

    return this;
  };

  /**
   * Returns the symbol list of the output numeral system.
   *
   * @returns {string|string[]}
   */
  RadixConverter.prototype.opSymbols = function() {
    return this._opSymbols;
  };

  /**
   * Returns the radix of the output numeral system.
   *
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
    var ipRadix = this.ipRadix(), ipMap = this._ipMap;

    var ns = [0], nlen = ns.length;
    for (var i = 0, len = ip.length; i < len; ++i) {
      if (!ipMap.exists(ip[i])) {
        throw new Error("invalid argument: unknown digit");
      }

      var j = 0, n = ipMap.get(ip[i]);
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
