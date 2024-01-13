import {stripCommentsFromContent} from './utils.js';
import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';

export const MATERIAL_ALL_IMPORT_REGEX =
	/import\s+['"]@material\/web\/all(\.js)?['"]\s*( ?;)?/;

export const MD_ELEMENT_REGEX = /<(md-[\w-]+)/;
export const MD_ICON_REGEX =
	/(<md-icon(?<!=>)[\s\S]*?>)\s*([a-z_]+)\s*(<\/md-icon\s*>)/;

/**
 * General regexp function that returns the result of `matchAll` on the
 * provided content.
 */
export function matchAllFromContent(
	content: string,
	regexp: RegExp,
	stripComments = true
) {
	regexp = new RegExp(regexp, 'g');
	if (stripComments) {
		content = stripCommentsFromContent(content);
	}
	return content.matchAll(regexp);
}

export async function matchAllFromFile(
	filepath: string,
	regexp: RegExp,
	stripComments = true
) {
	if (!existsSync(filepath)) {
		return undefined;
	}

	const content = (await readFile(filepath)).toString('utf8');
	return matchAllFromContent(content, regexp, stripComments);
}
