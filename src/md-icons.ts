import {CodePointsMap, MdIconName} from './codepoints-maps.js';
import type {CodePointsMapType} from './fonts.js';
import {MD_ICON_REGEX, matchAllFromContent} from './regexps.js';
import {stripCommentsFromContent} from './utils.js';
import {readFile} from 'node:fs/promises';

export {MD_ICON_REGEX};

export enum Variant {
	OUTLINED = 'outlined',
	ROUNDED = 'rounded',
	SHARP = 'sharp',
}

export type VariantValue = keyof typeof Variant;

/**
 * Take a list of icon names and return a filtered array
 * keeping only icon names known to the library.
 */
export function pruneFakeIconNames(names: string[]): MdIconName[] {
	const availableNames = Object.keys(CodePointsMap);
	return names.filter((el) => availableNames.includes(el)) as MdIconName[];
}

/**
 * Takes a content and returns all existing md-icon names found inside.
 * Pruned and unified.
 *
 * @argument content Content to analyze.
 * @argument includeComments Whether to strip comment from the content or not.
 */
export function findIconNamesFromContent(
	content: string,
	includeComments = false
): MdIconName[] {
	const namesSet = new Set<any>();

	const matches = matchAllFromContent(content, MD_ICON_REGEX, includeComments);

	for (const match of matches) {
		namesSet.add(match[2]);
	}

	let names: MdIconName[] = Array.from(namesSet);
	names = pruneFakeIconNames(names);

	return names;
}

/**
 * Takes a filepath and returns all existing md-icon names found inside the
 * corresponding file.
 * Pruned and unified.
 *
 * @argument filepath Path of the file to analyze.
 * @argument includeComments Whether to strip comment from the content or not.
 */
export async function findIconNamesFromFile(
	filepath: string,
	includeComments = false
): Promise<MdIconName[]> {
	const content = (await readFile(filepath)).toString();
	return findIconNamesFromContent(content, includeComments);
}

/**
 * Takes an array of files and returns all existing md-icon names found inside the
 * corresponding files.
 * Pruned and unified.
 *
 * @argument filepaths Array of files to analyze.
 * @argument includeComments Whether to strip comment from the content or not.
 */
export async function findIconNamesFromFiles(
	filepaths: string[],
	includeComments = false
): Promise<MdIconName[]> {
	const names = await Promise.all(
		filepaths.map(
			(filepath) =>
				new Promise(async (resolve, reject) => {
					try {
						resolve(await findIconNamesFromFile(filepath, includeComments));
					} catch (error) {
						reject(error);
					}
				})
		)
	);

	// Return flatten and unified.
	return [...new Set(names.flat())] as MdIconName[];
}

export function replaceIconNamesWithCodePoints(
	content: string,
	codePointsMap: CodePointsMapType,
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
