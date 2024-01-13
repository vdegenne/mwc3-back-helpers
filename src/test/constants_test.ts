import {assert, expect} from 'chai';
import {
	MATERIAL_ALL_IMPORT_REGEX,
	MD_ELEMENT_REGEX,
	MD_ICON_REGEX,
} from '../constants.js';

describe('MATERIAL_ALL_IMPORT_REGEXP', () => {
	it('matches double-quotes imports', () => {
		assert.isTrue(
			MATERIAL_ALL_IMPORT_REGEX.test(`import "@material/web/all.js";`)
		);
	});
	it('matches single-quote imports', () => {
		assert.isTrue(
			MATERIAL_ALL_IMPORT_REGEX.test(`import '@material/web/all.js';`)
		);
	});
	it('matches without .js extension explicitely written', () => {
		assert.isTrue(
			MATERIAL_ALL_IMPORT_REGEX.test(`import '@material/web/all';`)
		);
	});
	it('matches without a final semi colon', () => {
		assert.isTrue(
			MATERIAL_ALL_IMPORT_REGEX.test(`import '@material/web/all.js'`)
		);
	});
	it('can have spaces before semi colon', () => {
		assert.isTrue(
			MATERIAL_ALL_IMPORT_REGEX.test(`import '@material/web/all.js'    ;`)
		);
	});
	it('matches even with spaces', () => {
		assert.isTrue(
			MATERIAL_ALL_IMPORT_REGEX.test(`import    '@material/web/all.js'   `)
		);
	});
	it('matches anywhere', () => {
		assert.isTrue(
			MATERIAL_ALL_IMPORT_REGEX.test(`

               import    '@material/web/all.js'

               ;`)
		);
	});
	it('can be used to replace import', () => {
		const input = `AAAA import   '@material/web/all.js'    ; BBBB`;
		const replaced = input.replace(MATERIAL_ALL_IMPORT_REGEX, 'REPLACED');
		assert.equal(replaced, 'AAAA REPLACED BBBB');
	});
	it('can be used to replace multiple imports', () => {
		const input = `AAAA import   '@material/web/all.js'    ; BBBB
          CCCC import '@material/web/all.js'; DDDD
          `;
		const replaced = input.replace(
			new RegExp(MATERIAL_ALL_IMPORT_REGEX, 'g'),
			'REPLACED'
		);
		assert.equal(
			replaced,
			`AAAA REPLACED BBBB
          CCCC REPLACED DDDD
          `
		);
	});
});

describe('MATERIAL_ELEMENT_REGEXP', () => {
	it('matches basic element', () => {
		const input = `<md-icon>settings</md-icon>`;
		const match = input.match(MD_ELEMENT_REGEX)!;
		assert.equal(match[1], 'md-icon');
	});
	it('matches multi-line element', () => {
		const input = `<md-icon>
          settings
          </md-icon>
          `;
		const match = input.match(MD_ELEMENT_REGEX)!;
		assert.equal(match[1], 'md-icon');
	});
	it('matches broken tag', () => {
		const input = `<md-icon
          >
          settings
          </md-icon>
          `;
		const match = input.match(MD_ELEMENT_REGEX)!;
		assert.equal(match[1], 'md-icon');
	});
	it('ignores arrow functions', () => {
		const input = `<md-icon @click=${() => console.log('test')}
          >settings</md-icon>`;
		const match = input.match(MD_ELEMENT_REGEX)!;
		assert.equal(match[1], 'md-icon');
	});
	it('can be used to match multiple elements', () => {
		const input = `<md-icon
          >settings</md-icon>
          <md-menu>
            <md-menu-item>test</md-menu-item>
          </md-menu>
          `;
		const matches = input.matchAll(new RegExp(MD_ELEMENT_REGEX, 'g'));
		let elements = [];
		for (const match of matches) {
			elements.push(match[1]);
		}
		assert.deepEqual(elements, ['md-icon', 'md-menu', 'md-menu-item']);
	});
});

describe('MD_ICON_REGEX', () => {
	it('extracts icon name', () => {
		const input = `<md-icon>settings</md-icon>`;

		const match = input.match(MD_ICON_REGEX)!;
		expect(match[2]).to.equal('settings');
	});

	it('catches multi lines icons', () => {
		const input = `
     <md-icon
     >settings</md-icon
     >
     `;

		const match = input.match(MD_ICON_REGEX)!;
		expect(match[2]).to.equal('settings');
	});

	it('ignores attributes', () => {
		const input = `<md-icon class="test">settings</md-icon>`;

		const match = input.match(MD_ICON_REGEX)!;
		expect(match[2]).to.equal('settings');
	});

	it('fails when there is a lit event binding', () => {
		const input = `<md-icon @click=${() => {
			null;
		}}>settings</md-icon>`;

		const match = input.match(MD_ICON_REGEX)!;
		expect(match[2]).to.equal('settings');
	});

	it('can be used to replace content', () => {
		const input = `
          <md-icon> settings</md-icon>
          <md-icon>delete</md-icon>
          `;

		const replaced = input.replaceAll(
			new RegExp(MD_ICON_REGEX, 'g'),
			(_, opening, _name, closing) => {
				return `${opening}test${closing}`;
			}
		);

		expect(replaced).to.equal(`
          <md-icon>test</md-icon>
          <md-icon>test</md-icon>
          `);
	});

	it('takes care of spaces in content', () => {
		const input = `<md-icon>  settings </md-icon>`;

		const match = input.match(MD_ICON_REGEX)!;
		expect(match[1]).to.equal('<md-icon>');
		expect(match[2]).equals('settings');
		expect(match[3]).to.equal('</md-icon>');
	});
});
