import {MdElementsImportsMap} from './md-elements-imports-map.js';

export {MdElementsImportsMap};

/**
 * Take a list of element names and return a filtered array
 * keeping only md-* elements that exist in the library.
 */
export async function pruneFakeElements(elements: string[]) {
	const availableElements = Object.keys(MdElementsImportsMap);
	return elements.filter((el) => availableElements.includes(el));
}
