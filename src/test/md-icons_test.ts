import {expect} from 'chai';
import {
	findIconNamesFromContent,
	findIconNamesFromFiles,
	replaceIconNamesWithCodePoints,
} from '../md-icons.js';
import {CodePointsMap} from '../codepoints-maps.js';
import {readFile} from 'node:fs/promises';

describe('md-icons module', () => {
	const doSomething = () => {};

	const content = `
    <md-icon>settings</md-icon>
    <md-icon>settings</md-icon>
    <md-icon> remove_red_eye</md-icon>
    <md-icon>fake_icon_name</md-icon>
    <md-icon>
          delete
    </md-icon>
    <md-icon
      >add</md-icon 
    >
    <md-icon @click=${() => doSomething()}> arrow_back </md-icon>
    // <md-icon>play_arrow</md-icon>
    /** <md-icon>10k</md-icon> */
    <!-- <md-icon>refresh</md-icon> -->
    <md-icon>another_fake_icon_name</md-icon>
`;

	it('extracts icon names from content', async () => {
		const iconNames = findIconNamesFromContent(content);
		expect(iconNames).to.deep.equal([
			'settings',
			'remove_red_eye',
			'delete',
			'add',
			'arrow_back',
		]);
	});

	it('extracts icon names from comments', async () => {
		const iconNames = findIconNamesFromContent(content, true);
		expect(iconNames).to.deep.equal([
			'settings',
			'remove_red_eye',
			'delete',
			'add',
			'arrow_back',
			'play_arrow',
			'10k',
			'refresh',
		]);
	});

	it('prunes unknown icon names', async () => {
		const iconNames = findIconNamesFromContent(content, true);
		expect(iconNames).to.not.contain('fake_icon_name');
		expect(iconNames).to.not.contain('another_fake_icon_name');
	});

	describe('Icon names replacement', () => {
		it('replaces icon names with codepoints', async () => {
			const map = CodePointsMap;

			let content = '<md-icon>10k</md-icon>';
			let result = replaceIconNamesWithCodePoints(content, map);
			expect(result).to.equal('<md-icon>&#xe951;</md-icon>');

			content = '<md-icon>unknown_name</md-icon>';
			result = replaceIconNamesWithCodePoints(content, map);
			expect(result).to.equal('<md-icon>unknown_name</md-icon>');

			content = '<md-icon>settings</md-icon><md-icon>delete</md-icon>';
			result = replaceIconNamesWithCodePoints(content, map);
			expect(result).to.equal(
				'<md-icon>&#xe8b8;</md-icon><md-icon>&#xe92e;</md-icon>'
			);

			content = `
<md-icon>  settings</md-icon>
<md-icon
>  delete    </md-icon
>`;
			result = replaceIconNamesWithCodePoints(content, map);
			expect(result).to.equal(
				`
<md-icon>&#xe8b8;</md-icon>
<md-icon
>&#xe92e;</md-icon
>`
			);

			content = `
<md-icon>  settings</md-icon>
// <md-icon>remove_red_eyes</md-icon>
<md-icon>  delete    </md-icon>
/* <md-icon>10k</md-icon> */
<md-icon>sell</md-icon>
/**
 * <md-icon>lock_person</md-icon>
 */
<md-icon>lock</md-icon>
<!-- <md-icon>arrow_left</md-icon> -->
<!-- <md-icon>non_existing_name</md-icon> -->
<md-icon>arrow_back</md-icon>
`;
			result = replaceIconNamesWithCodePoints(content, map);

			expect(result).to.equal(
				`
<md-icon>&#xe8b8;</md-icon>

<md-icon>&#xe92e;</md-icon>

<md-icon>&#xf05b;</md-icon>

<md-icon>&#xe899;</md-icon>


<md-icon>&#xe5c4;</md-icon>
`
			);

			result = replaceIconNamesWithCodePoints(content, map, true);

			expect(result).to.equal(
				`
<md-icon>&#xe8b8;</md-icon>
// <md-icon>remove_red_eyes</md-icon>
<md-icon>&#xe92e;</md-icon>
/* <md-icon>&#xe951;</md-icon> */
<md-icon>&#xf05b;</md-icon>
/**
 * <md-icon>&#xf8f3;</md-icon>
 */
<md-icon>&#xe899;</md-icon>
<!-- <md-icon>&#xe5de;</md-icon> -->
<!-- <md-icon>non_existing_name</md-icon> -->
<md-icon>&#xe5c4;</md-icon>
`
			);
		});

		it("doesn't weirdly break urls.", async () => {
			const content = 'https://example.com/test/path/resource.js';
			const result = replaceIconNamesWithCodePoints(content, CodePointsMap);
			expect(result).to.equal(content);
		});
	});

	describe('findIconNamesFromFiles', () => {
		it("throws if some files don't exist", async () => {
			let err: Error | undefined;
			try {
				await findIconNamesFromFiles(['non-existing-file']);
			} catch (error: any) {
				err = error as Error;
			}

			expect(err).to.be.an('error');
			expect(err!.message).to.contain('ENOENT');
		});

		it('returns icon names from files', async () => {
			const elements = await findIconNamesFromFiles([
				'./fixtures/src/a-element.js',
				'./fixtures/src/b-element.js',
			]);

			expect(elements.length).to.equal(3);
			expect(elements).to.deep.equal(['soap', 'delete', 'remove_red_eye']);
		});

		it('can analyze comments', async () => {
			const elements = await findIconNamesFromFiles(
				['./fixtures/src/a-element.js', './fixtures/src/b-element.js'],
				true
			);

			expect(elements.length).to.equal(5);
			expect(elements).to.deep.equal([
				'soap',
				'delete',
				'add',
				'10k',
				'remove_red_eye',
			]);
		});
	});
});
