import {expect} from 'chai';
import {
	findIconNamesFromContent,
	replaceIconNamesWithCodePoints,
} from '../md-icons.js';
import {CodePointsMap, OutlinedCodePointsMap} from '../codepoints-maps.js';

describe('md-icons module', () => {
	const doSomething = () => {};

	const content = `
    <md-icon>settings</md-icon>
    <md-icon>settings</md-icon>
    <md-icon> remove_red_eye</md-icon>
    <md-icon>
          delete
    </md-icon>
    <md-icon
      >add</md-icon 
    >
    <md-icon @click=${() => doSomething()}> arrow_back </md-icon>
    // <md-icon>play_arrow</md-icon>
    /** <md-icon>test</md-icon> */
    <!-- <md-icon>asdf</md-icon> -->
`;

	// TODO: shouldn't return icon names that don't exist
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
			'test',
			'asdf',
		]);
	});

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
});
