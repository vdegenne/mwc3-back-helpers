/**
 * This script is used to generate full symbols stylesheet/font artifacts
 * provided with the publication so users can use them when they are
 * dev'ing offline 😃
 * It needs to be run after `generate-codepoint-docs.ts`
 * and `generate-imports-map.ts` because it depends on objects
 * produced by these two.
 */
import {mkdir} from 'fs/promises';
import {
	downloadSymbolsFontFromStyleSheet,
	replaceSymbolsFontUrlInStyleSheet,
} from '../src/fonts.js';
import {writeFile} from 'fs/promises';

/** stylesheet to download */
const url =
	'https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined';

async function main() {
	const response = await fetch(url);
	let stylesheet = await response.text();
	await downloadSymbolsFontFromStyleSheet(stylesheet, {
		filepath: 'all-symbols/material-symbols.woff2',
	});
	stylesheet = replaceSymbolsFontUrlInStyleSheet(
		stylesheet,
		'./material-symbols.woff2'
	);
	await writeFile('all-symbols/material-symbols.css', stylesheet, {
		encoding: 'utf8',
	});
}

main();
