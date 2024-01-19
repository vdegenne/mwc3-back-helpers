import {readFile} from 'node:fs/promises';
import {MdElement, MdElementsImportsMap} from './md-elements-imports-map.js';
import {MD_ELEMENT_REGEX, matchAllFromContent} from './regexps.js';

export {MD_ELEMENT_REGEX, MdElementsImportsMap};

/**
 * Take a list of element names and return a filtered array
 * keeping only md-* elements that exist in the library.
 */
export function pruneFakeElements(elements: string[]): MdElement[] {
	const availableElements = Object.keys(MdElementsImportsMap);
	return elements.filter((el) => availableElements.includes(el)) as MdElement[];
}

/**
 * Takes a content and returns all existing md-* elements found inside.
 * Pruned and unified.
 *
 * @argument content Content to analyze.
 * @argument includeComments Whether to strip comment from the content or not.
 */
export function findElementsFromContent(
	content: string,
	includeComments = false
): MdElement[] {
	const elementsSet = new Set<any>();

	const matches = matchAllFromContent(
		content,
		MD_ELEMENT_REGEX,
		includeComments
	);

	for (const match of matches) {
		elementsSet.add(match[1]);
	}

	let elements: MdElement[] = Array.from(elementsSet);
	elements = pruneFakeElements(elements);

	return elements;
}

/**
 * Takes a filepath and returns all existing md-* elements found inside the
 * corresponding file.
 * Pruned and unified.
 *
 * @argument filepath Path of the file to analyze.
 * @argument includeComments Whether to strip comment from the content or not.
 */
export async function findElementsFromFile(
	filepath: string,
	includeComments = false
): Promise<MdElement[]> {
	const content = (await readFile(filepath)).toString();
	return findElementsFromContent(content, includeComments);
}

/**
 * Takes an array of files and returns all existing md-* elements found inside the
 * corresponding files.
 * Pruned and unified.
 *
 * @argument filepaths Array of files to analyze.
 * @argument includeComments Whether to strip comment from the content or not.
 */
export async function findElementsFromFiles(
	filepaths: string[],
	includeComments = false
): Promise<MdElement[]> {
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
	return [...new Set(elements.flat())] as MdElement[];
}
