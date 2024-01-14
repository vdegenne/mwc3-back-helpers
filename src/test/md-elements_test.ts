import {expect} from 'chai';
import {
	MdElementsImportsMap,
	findElementsFromContent,
	findElementsFromFiles,
	pruneFakeElements,
} from '../md-elements.js';

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

	it('can prune fake elements', () => {
		const elements: any[] = [
			'md-icon',
			'md-fake-element',
			'md-icon-button',
			'fake',
		];
		const pruned = pruneFakeElements(elements);
		expect(pruned).to.deep.equal(['md-icon', 'md-icon-button']);
	});

	describe('findElementsFromContent', () => {
		it('should find elements', () => {
			const input = `<md-icon>settings</md-icon>`;
			const elements = findElementsFromContent(input);

			expect(elements.length).to.equal(1);
			expect(elements[0]).to.equal('md-icon');
		});

		it('should find multiple elements', () => {
			const input = `
          <md-icon>settings</md-icon>
          <md-menu>
            <md-menu-item>test</md-menu-item>
          </md-menu>
          `;
			const elements = findElementsFromContent(input);

			expect(elements).to.deep.equal(['md-icon', 'md-menu', 'md-menu-item']);
		});

		it('should return a distinct result', () => {
			const input = `
          <md-icon>settings</md-icon>
          <md-icon>delete</md-icon>
          `;
			const elements = findElementsFromContent(input);

			expect(elements.length).to.equal(1);
			expect(elements[0]).to.equal('md-icon');
		});

		it('should ignore comments by default', () => {
			const input = ` // <md-fab></md-fab>
          // <md-icon>settings</md-icon>
          <!-- <md-chip-set></md-chip-set> -->
          <md-circular-progress></md-circular-progress>
          `;
			const elements = findElementsFromContent(input);

			expect(elements.length).to.equal(1);
			expect(elements[0]).to.equal('md-circular-progress');
		});

		it('can take an argument to include comments', () => {
			const input = ` // <md-fab></md-fab>
          // <md-icon>settings</md-icon>
          <!-- <md-chip-set></md-chip-set> -->
          <md-circular-progress></md-circular-progress>
          `;
			const elements = findElementsFromContent(input, true);

			expect(elements.length).to.equal(4);
			expect(elements).to.deep.equal([
				'md-fab',
				'md-icon',
				'md-chip-set',
				'md-circular-progress',
			]);
		});

		it('should prune fake elements', () => {
			const input = `
          <md-icon>settings</md-icon>
          <md-this-element-does-not-exist></md-this-element-does-not-exist>`;
			const elements = findElementsFromContent(input);

			expect(elements.length).to.equal(1);
			expect(elements[0]).to.equal('md-icon');
		});
	});

	describe('findElementsFromFiles', () => {
		it("throws if some files don't exist", async () => {
			let err: Error | undefined;
			try {
				await findElementsFromFiles(['non-existing-file']);
			} catch (error: any) {
				err = error as Error;
			}

			expect(err).to.be.an('error');
			expect(err!.message).to.contain('ENOENT');
		});

		it('returns elements from files', async () => {
			const elements = await findElementsFromFiles([
				'./fixtures/src/a-element.js',
				'./fixtures/src/b-element.js',
			]);

			expect(elements.length).to.equal(3);
			expect(elements).to.deep.equal(['md-icon-button', 'md-icon', 'md-fab']);
		});

		it('can analyze comments', async () => {
			const elements = await findElementsFromFiles(
				['./fixtures/src/a-element.js', './fixtures/src/b-element.js'],
				true
			);

			expect(elements.length).to.equal(6);
			expect(elements).to.deep.equal([
				'md-divider',
				'md-icon-button',
				'md-icon',
				'md-chip-set',
				'md-text-button',
				'md-fab',
			]);
		});
	});
});
