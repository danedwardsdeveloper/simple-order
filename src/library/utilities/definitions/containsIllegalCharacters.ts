export const allowedCharacters = {
	letters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
	numbers: '0123456789',
	punctuation: `',.!? -`,
}

export function containsIllegalCharacters(input: string): boolean {
	const allAllowedCharacters = [...allowedCharacters.letters, ...allowedCharacters.numbers, ...allowedCharacters.punctuation]
	return input.split('').some((character) => !allAllowedCharacters.includes(character))
}
