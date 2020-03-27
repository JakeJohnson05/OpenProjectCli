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
		let lastDigits = [...index.toString().slice(-2)];
		while (lastDigits.length < 2) lastDigits.unshift('0');
		return index + numEnding.apply(null, lastDigits);
	}
}
