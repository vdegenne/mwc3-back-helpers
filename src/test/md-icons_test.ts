import {expect} from 'chai';
import {findIconNamesFromContent} from '../md-icons.js';

const doSomething = () => {
	/*do nothing*/
};

describe('md-icons module', () => {
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
});
