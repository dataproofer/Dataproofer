/**
 * Creates an individual test instance.
 *
 * @class DataprooferTest
 * @param {Object} options contains testing functions
 * @param options.methodology **MUST BE INCLUDED TO WORK.** Begins testing and defaults to empty result object
 * @example
 * var DataprooferTest = require('DataprooferTest');
 * var myTest = new DataprooferTest({
 *   methodology: function(rows, columnHeads, input) {
 *      var testState;
 *      if (rows.length > 0) {
 *        testState = "passed";
 *      } else {
 *        testState = "failed";
 *      }
 *      // RESULTS MUST INCLUDE THESE FIVE KEY VALUES
 *      return {
 *         testState: testState, // the result of the test
 *         highlightedCells: [...] // array of cell objects to highlight
 *      }
 *   }
 * });
 *
 * // {
 * //   testState: "failed",
 * //   highlightedCells: [...]
 * // };
 */
var DataprooferTest = function (options) {
  if (options) {
    var name = this.options.name || null;
    var description = this.options.description || null;
    var conclusion = this.options.conclusion || null;
    var methodology = this.options.methodology || null;

    if (name && typeof name === "string") {
      this._name = name;
    } else {
      this._name = "";
    }

    if (description && typeof description === "string") {
      this._description = description;
    } else {
      this._description = "";
    }

    if (conclusion && typeof conclusion === "string") {
      this._conclusion = conclusion;
    } else if (typeof conclusion === "function") {
      this._conclusionFactory = conclusion;
      this._conclusion = "";
    } else {
      this._conclusion = "";
    }

    if (methodology && typeof methdology === "function") {
      this._methodology = methodology;
    } else {
      this._methodology = function (rows, columnHeads, input) {
        return {
          testState: "failed",
          name: this._name,
          description: this._description,
          conclusion: this._conclusion,
          highlightedCells: [],
        };
      };
    }
  } else {
    this._name = "";
    this._description = "";
    this._conclusion = "";
    this._methodology = function (rows, columnHeads, input) {
      return {
        testState: "failed",
        name: this._name,
        description: this._description,
        conclusion: this._conclusion,
        highlightedCells: [],
      };
    };
  }
};

DataprooferTest.prototype = {
  /**
   * Get a test's full name
   * @returns {String} containing the name of the test
   * @example
   * var myTest = newDataprooferTest({...});
   * myTest.name();
   *
   * // "My test"
   */
  /**
   * Set a test's name
   * @param {String} providing a more explicative, full name for the test
   * @returns {DataprooferTest}
   * @example
   * var myTest = newDataprooferTest({...});
   * myTest.name("My test");
   */
  name: function (nameString) {
    var result;
    if (arguments.length === 0) {
      result = this._name;
    } else if (typeof nameString === "string") {
      this._name = nameString;
      result = this;
    } else {
      result = undefined;
      console.error("Must provide a string as the name");
    }
    return result;
  },

  /**
   * Get a test's description
   * @returns {String} containing a description of the test
   * @example
   * var myTest = newDataprooferTest({...});
   * myTest.description();
   *
   * // "Counts the rows of a spreadsheet"
   */
  /**
   * Set a test's description
   * @param {String} providing a description of the test
   * @returns {DataprooferTest}
   * @example
   * var myTest = newDataprooferTest({...});
   * myTest.description("Counts the rows of a spreadsheet");
   */
  description: function (descriptionString) {
    var result;
    if (arguments.length === 0) {
      result = this._description;
    } else if (typeof descriptionString === "string") {
      this._description = descriptionString;
      result = this;
    } else {
      result = undefined;
      console.error("Must provide a string as the description");
    }
    return result;
  },

  /**
   * Get a test's proofing function, aka its methodology
   * @returns {Function} describing the test's current functions
   * @example
   * var myTest = new DataprooferTest({...});
   * myTest.methodology();
   *
   * // function(rows, columnHeads, input) {...}
   */
  /**
   * Set a test's proofing function, aka its methodology
   * @param {Function} that takes a function and returns an object. See {DataprooferTest}
   * @returns {DataprooferTest}
   * @example
   * var myTest = new DataprooferTest({...});
   * myTest.methodology(function);
   */
  methodology: function (methodologyFunction) {
    var result;
    if (arguments.length === 0) {
      result = this._methodology;
    } else if (typeof methodologyFunction === "function") {
      this._methodology = methodologyFunction;
      result = this;
    } else {
      result = undefined;
      console.error("Must provide a function to proof data");
    }
    return result;
  },

  /**
   * Runs a user-specified test. If no test is specified, a default "results" object is returned
   *
   * @param [rows=[]] an array of row objects; column heads are keys, cells are values.
   * @param [columnHeads=[]] an array of column head names
   * @param [input=[]] an array objects representing user input
   * @returns {Object} default result object describing the test
   * @example
   * var myTest = new DataprooferTest({...});
   * myTest.proof(rows, columnHeads, input);
   *
   * // {
   * //   testState: "failed", # default boolean
   * //   name: "", # default empty string
   * //   description: "", # default empty string
   * //   summary: "", # default empty string
   * //   highlightedCells: [] # default empty array
   * // };
   */
  proof: function (rows, columnHeads, input) {
    rows = rows || [];
    columnHeads = columnHeads || [];
    input = input || {};
    return this._methodology(rows, columnHeads, input);
  },

  /**
   * Runs a user-specified test and returns the result as a string
   *
   * @param [rows=[]] an array of row objects; column heads are keys, cells are values.
   * @param [columnHeads=[]] an array of column head names
   * @returns {Object} default result object describing the test
   * @example
   * var myTest = new DataprooferTest({...});
   * myTest.doesPass(rows, columnHeads, input);
   *
   * // "failed"
   */
  doesPass: function (rows, columnHeads, input) {
    var _test = new DataprooferTest();
    rows = rows || [];
    columnHeads = columnHeads || [];
    var result =
      _test.proof(rows, columnHeads, input).testState ||
      "Error: Methodology must return an object with a 'testState' key!";
    return result;
  },

  /**
   * Get a test's conclusion —
   * next steps someone should take if a test does not pass.
   * @returns {String} containing a conclusion if a test does not pass
   * @example
   * var myTest = newDataprooferTest({...});
   * myTest.conclusion();
   *
   * // "This spreadsheet has more than one row."
   */
  /**
   * Set a test's description with a string independent of the test result
   * @param {String} containing a conclusion if a test or does not pass
   * @returns {DataprooferTest}
   * @example
   * var myTest = newDataprooferTest({...});
   * myTest.conclusion("This spreadsheet has more than one row.");
   */
  /**
   * Set a test's description with a string dependent on the test result
   * @param {Function} containing a conclusion if a test or does not pass
   * @returns {DataprooferTest}
   * @example
   * var myTest = newDataprooferTest({...});
   * myTest.conclusion(function(result) {
   *   if(result.testState === "passed") {
   *     return "Passed. You may use this dataset"
   *   } else {
   *     return "You may not use this dataset"
   *   }
   * });
   */
  conclusion: function (input) {
    var result;
    if (arguments.length === 0) {
      result = this._conclusion;
    } else if (typeof input === "object") {
      // input is a test result, pass it into the factory to generate
      // a conclusion
      if (typeof this._conclusionFactory === "function") {
        this._conclusion = this._conclusionFactory(input);
      }
      result = this._conclusion;
    } else if (typeof input === "string") {
      // set the conclusion as a string
      this._conclusion = input;
      result = this;
    } else if (typeof input === "function") {
      // set a function that generates a conclusion based on a result
      this._conclusionFactory = input;
      result = this;
    } else {
      result = undefined;
      console.error("Must provide a string as the conclusion");
    }
    return result;
  },
};

module.exports = DataprooferTest;
