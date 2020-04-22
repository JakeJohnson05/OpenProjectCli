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

module.exports = {
	numFocusLevels: 3,
	/**
	 * Get the position text for an index
 	 * @param {number}	index
 	 * @returns {string}
 	 */
	getPositionText: index => {
		if (index < 0) return index.toString();
		if (index < orderTexts.length) return orderTexts[index];
		index++;
		let last2Digits = [...index.toString().slice(-2)];
		while (last2Digits.length < 2) last2Digits.unshift('0');
		return index + numEnding.apply(null, last2Digits);
	}
}
