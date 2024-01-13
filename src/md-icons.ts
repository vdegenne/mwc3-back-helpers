import {MD_ICON_REGEX, matchAllFromContent} from './regexps.js';
import {readFile} from 'node:fs/promises';

export {MD_ICON_REGEX};

export enum Variant {
	OUTLINED = 'Outlined',
	ROUNDED = 'Rounded',
	SHARP = 'Sharp',
}

// export type VariantValue = (typeof Variant)[keyof typeof Variant];

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
