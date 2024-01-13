import {expect} from 'chai';
import {MdElementsImportsMap, pruneFakeElements} from '../md-elements.js';

describe('md-elements module', () => {
	describe('imports map', () => {
		it('maps elements to their corresponding import path', async () => {
			expect(MdElementsImportsMap['md-icon-button']).to.equal(
				'@material/web/iconbutton/icon-button.js'
			);
			expect(MdElementsImportsMap['md-menu']).to.equal(
				'@material/web/menu/menu.js'
			);
			// etc...
		});
	});

	it('can prune fake elements', async () => {
		const elements = ['md-icon', 'md-fake-element', 'md-icon-button', 'fake'];
		const pruned = await pruneFakeElements(elements);
		expect(pruned).to.deep.equal(['md-icon', 'md-icon-button']);
	});
});
