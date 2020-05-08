const { writeFile } = require('fs');
const { join } = require('path');

/**
 * @callback NoParamCallback
 * @param {NodeJS.ErrnoException | null} err
 * @return {void}
 */

/**
 * Write content to the do-not-open-output-path.txt
 * @param {string}					[content]
 * @param {NoParamCallback}	[callback]
 * @param {any[]}						[args]
 * @return {void}
 */
const writeDoNotEditFile = (content = 'true', callback = process.exit, ...args) => writeFile(join(__dirname, 'do-not-open-output-path.txt'), content, args.length ? _ => callback.apply(null, args) : callback);

/** Matches to input that are reserved keywords */
const invalidValues = [/^CREATE NEW$/, /^OPENFOCUS [\d]+$/, /^OPENLASTPATH$/];

/** Full position text options for the first 10 index values [0, ..., 9] */
const orderTexts = ['Primary', 'Secondary', 'Tertiary', 'Quaternary', 'Quinary', 'Senary', 'Septenary', 'Octonary', 'Nonary', 'Denary'];

/**
 * Finds the ending for the proper number
 * @param {string}	secondToLastDigit
 * @param {string}	lastDigit
 * @returns {string}
 */
const numEnding = (secondToLastDigit, lastDigit) => {
	if (secondToLastDigit === '1') return 'th';
	switch (lastDigit) {
		case '1': return 'st';
		case '2': return 'nd';
		case '3': return 'rd';
		default: return 'th';
	}
}

/**
 * Get the position text for an index
 * @param {number}	index
 * @returns {string}
 */
const getPositionText = index => {
	if (index < 0) return index.toString();
	if (index < orderTexts.length) return orderTexts[index];
	index++;
	let last2Digits = [...index.toString().slice(-2)];
	while (last2Digits.length < 2) last2Digits.unshift('0');
	return index + numEnding.apply(null, last2Digits);
}

module.exports = {
	numFocusLevels: 3,
	writeDoNotEditFile,
	getPositionText,
	invalidValues
}
