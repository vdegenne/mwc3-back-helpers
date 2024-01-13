import {CodePointsMap} from './fonts.js';
import {MD_ICON_REGEX, matchAllFromContent} from './regexps.js';
import {stripCommentsFromContent} from './utils.js';

export {MD_ICON_REGEX};

export enum Variant {
	OUTLINED = 'outlined',
	ROUNDED = 'rounded',
	SHARP = 'sharp',
}

export type VariantValue = keyof typeof Variant;

export function findIconNamesFromContent(
	content: string,
	includeComments = false
) {
	const namesSet = new Set<string>();

	const matches = matchAllFromContent(content, MD_ICON_REGEX, includeComments);

	for (const match of matches) {
		namesSet.add(match[2]);
	}

	return Array.from(namesSet);
}

export function replaceIconNamesWithCodePoints(
	content: string,
	codePointsMap: CodePointsMap,
	includeComments = false
) {
	const regexp = new RegExp(MD_ICON_REGEX, 'g');

	if (!includeComments) {
		content = stripCommentsFromContent(content);
	}

	content = content.replaceAll(regexp, (_, opening, name, closing) => {
		const codepoint = codePointsMap[name];
		return `${opening}${codepoint ? `&#x${codepoint};` : name}${closing}`;
	});

	return content;
}
