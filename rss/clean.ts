import sanitizeHtml from 'sanitize-html';

// replace double spaces with a single space
export const WHITESPACRE_REGEX = /[ \t]{2,}/g;
// replace three or more newlines with two newlines
export const LINES_REGEX = /(?:[ \t]*\n[ \t]*){3,}/g;

export function sanitize(text: string) {
	const clean = sanitizeHtml(text, {
		allowedTags: ['b', 'i', 'em', 'strong', 'a', 'br'],
		allowedAttributes: {
			'a': ['href'],
		},
	});

	return clean.trim().replaceAll(WHITESPACRE_REGEX, ' ').replaceAll(LINES_REGEX, '\n\n');
}
