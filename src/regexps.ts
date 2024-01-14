import {stripCommentsFromContent} from './utils.js';
import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';

export const MATERIAL_ALL_IMPORT_REGEX =
	/import\s+['"]@material\/web\/all(\.js)?['"]\s*( ?;)?/;

export const MD_ELEMENT_REGEX = /<(md-[\w-]+)/;
export const MD_ICON_REGEX =
	/(<md-icon(?<!=>)[\s\S]*?>)\s*([0-9a-z_]+)\s*(<\/md-icon\s*>)/;

export const SYMBOLS_STYLESHEET_LINK_REGEX =
	/<link\s*href="https:\/\/fonts.googleapis.com\/css2\?family=Material\+Symbols[^"]+"[^>]*>/;

/**
 * General regexp function that returns the result of `matchAll` on the
 * provided content.
 */
export function matchAllFromContent(
	content: string,
	regexp: RegExp,
	includeComments = false
) {
	regexp = new RegExp(regexp, 'g');
	if (!includeComments) {
		content = stripCommentsFromContent(content);
	}
	return content.matchAll(regexp);
}

export async function matchAllFromFile(
	filepath: string,
	regexp: RegExp,
	includeComments = false
) {
	if (!existsSync(filepath)) {
		return undefined;
	}

	const content = (await readFile(filepath)).toString('utf8');
	return matchAllFromContent(content, regexp, includeComments);
}
