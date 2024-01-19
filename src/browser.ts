import {
	MdElementsImportsMap,
	type MdElement,
} from './md-elements-imports-map.js';

/**
 * Returns all available elements inside the page.
 * Make sure to call this function later after initial
 * page load to make sure all elements have been
 * registered in the customElements registry.
 */
export function getAvailableElements() {
	const elements = Object.keys(MdElementsImportsMap) as MdElement[];
	let available: MdElement[] = [];
	for (const element of elements) {
		if (window.customElements.get(element)) {
			available.push(element);
		}
	}
	return available;
}
