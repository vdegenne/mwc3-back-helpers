import {MdElementsImportsMap} from './md-elements-imports-map.js';
import {MD_ELEMENT_REGEX, matchAllFromContent} from './regexps.js';

export {MdElementsImportsMap, MD_ELEMENT_REGEX};

/**
 * Take a list of element names and return a filtered array
 * keeping only md-* elements that exist in the library.
 */
export function pruneFakeElements(elements: string[]) {
	const availableElements = Object.keys(MdElementsImportsMap);
	return elements.filter((el) => availableElements.includes(el));
}

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
