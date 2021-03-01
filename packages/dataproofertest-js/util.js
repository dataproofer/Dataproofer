/**
 * A set of comonly used utility functions for us inside tests
 */

var d3 = require("d3");

module.exports = {
  isNumeric: isNumeric,
  isString: isString,
  stripNumeric: stripNumeric,
  isEmpty: isEmpty,
  percent: percent,
};

/**
 * Check if a value is numeric (a cell's value could be a number in string form)
 * @param {value=?} A string, number or null value
 * @returns {boolean}
 */
function isNumeric(value) {
  if (typeof value === "number") return true;
  if (typeof value === "string") {
    if (value === "") return false;
    return !isNaN(value);
  }
  return false;
}

/**
 * Check if a value is numeric (a cell's value could be a number in string form)
 * @param {value=?} A string, number or null value
 * @returns {boolean}
 */
function isString(value) {
  if (typeof value === "string") return true;
  if (typeof value === "number") {
    if (value === "") return false;
    return !isNaN(value);
  }
  return false;
}

/**
 * Check if a cell's value is empty
 * @param {value=?} A string, number or null value
 * @returns {boolean}
 */
function isEmpty(value) {
  if (value === null) return true;
  if (typeof value === "undefined") return true;
  if (value === "") return true;
  if (/\S/.test(value) === false) return true;
  return false;
}

/**
 * Strip a cell of the following characters: "$", ",", "%"
 * @param {value=?} A string, number or null value
 * @returns {String}
 */
function stripNumeric(value) {
  if (typeof value === "number") return value;
  if (!value) value = "";
  if (typeof value === "string") {
    value = value.replace(/[$,%\s]/g, "");
    return value;
  }
}

/**
 * return a string representing the percentage of a fraction
 * @param {value=?} A string, number or null value
 * @returns {String}
 */
function percent(fraction) {
  var formatPercent = d3.format(".1f");
  return formatPercent(100 * fraction) + "%";
}
