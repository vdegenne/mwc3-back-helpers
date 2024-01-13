import {MdElementsImportsMap} from './md-elements-imports-map.js';
import {MD_ELEMENT_REGEX, matchAllFromContent} from './regexps.js';
import {readFile} from 'node:fs/promises';

export {MdElementsImportsMap, MD_ELEMENT_REGEX};

/**
 * Take a list of element names and return a filtered array
 * keeping only md-* elements that exist in the library.
 */
export function pruneFakeElements(elements: string[]) {
	const availableElements = Object.keys(MdElementsImportsMap);
	return elements.filter((el) => availableElements.includes(el));
}

/**
 * Takes a content and returns all existing md-* elements found inside.
 *
 * @argument content Content to analyze.
 * @argument includeComments Whether to strip comment from the content or not.
 */
export function findElementsFromContent(
	content: string,
	includeComments = false
) {
	const elementsSet = new Set<string>();

	const matches = matchAllFromContent(
		content,
		MD_ELEMENT_REGEX,
		includeComments
	);

	for (const match of matches) {
		elementsSet.add(match[1]);
	}

	let elements = Array.from(elementsSet);
	elements = pruneFakeElements(elements);

	return elements;
}

/**
 * Takes a filepath and returns all existing md-* elements found inside the
 * corresponding file.
 *
 * @argument filepath Path of the file to analyze.
 * @argument includeComments Whether to strip comment from the content or not.
 */
export async function findElementsFromFile(
	filepath: string,
	includeComments = false
) {
	const content = (await readFile(filepath)).toString();
	return findElementsFromContent(content, includeComments);
}
/**
 * Takes an array of files and returns all existing md-* elements found inside the
 * corresponding files.
 *
 * @argument filepaths Array of files to analyze.
 * @argument includeComments Whether to strip comment from the content or not.
 */
export async function findElementsFromFiles(
	filepaths: string[],
	includeComments = false
) {
	const elements = await Promise.all(
		filepaths.map(
			(filepath) =>
				new Promise(async (resolve, reject) => {
					try {
						resolve(await findElementsFromFile(filepath, includeComments));
					} catch (error) {
						reject(error);
					}
				})
		)
	);

	// Return flatten and unified.
	return [...new Set(elements.flat())];
}
