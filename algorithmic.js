function isSimilarByIncludingChunks(str1, str2) {
	str1 = str1.toLowerCase();
	str2 = str2.toLowerCase();

	// Get string with max and min length
	let min = str1.length < str2.length ? str1 : str2;
	let max = str1.length > str2.length ? str1 : str2;
	let corLen = 0;
	for (let len = 1; len < max.length; len++) {
		let includes = false;
		for (let i = 0; i < min.length-len; i++) {
			if (max.includes(min.substr(i, len))) {
				includes = true;
				break;
			}
		}
		if (includes) corLen = len;
	}
	
	// Return percentage of similarity
	return corLen/max.length;
}

function isSimilarByLevenshtein(a, b) {
	a = a.toLowerCase();
	b = b.toLowerCase();
	if (a.length === 0) return b.length;
	if (b.length === 0) return a.length;
	
	const matrix = [];

	// increment along the first column of each row
	for (let i = 0; i <= b.length; i++) {
		matrix[i] = [i];
	}

	// increment each column in the first row
	for (let j = 0; j <= a.length; j++) {
		matrix[0][j] = j;
	}

	// Fill in the rest of the matrix
	for (let i = 1; i <= b.length; i++) {
		for (let j = 1; j <= a.length; j++) {
			if (b.charAt(i - 1) == a.charAt(j - 1)) {
				matrix[i][j] = matrix[i - 1][j - 1];
			} else {
				matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
					Math.min(matrix[i][j - 1] + 1, // insertion
						matrix[i - 1][j] + 1)); // deletion
			}
		}
	}

	// Return percentage of similarity
	return (a.length-matrix[b.length][a.length])/a.length;
}

// Export all functions
module.exports = {
	isSimilarByIncludingChunks,
	isSimilarByLevenshtein
};