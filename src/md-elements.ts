import {MdElementsImportsMap} from './md-elements-imports-map.js';
import {MD_ELEMENT_REGEX, matchAllFromContent} from './regexps.js';
import {existsSync} from 'node:fs';
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
 * @argument stripComments Whether to strip content from the content or not.
 */
export function findElementsFromContent(content: string, stripComments = true) {
	const elementsSet = new Set<string>();

	const matches = matchAllFromContent(content, MD_ELEMENT_REGEX, stripComments);

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
 * @argument stripComments Whether to strip content from the content or not.
 */
export async function findElementsFromFile(
	filepath: string,
	stripComments = true
) {
	if (!existsSync(filepath)) {
		return undefined;
	}
	const content = (await readFile(filepath)).toString();
	return findElementsFromContent(content, stripComments);
}
