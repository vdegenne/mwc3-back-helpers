import {existsSync} from 'node:fs';
import {readFile, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {findImportsInContent, type ImportsMap} from '../src/utils.ts';

const allFilePath = join('node_modules', '@material', 'web', 'all.js');

async function main() {
	if (!existsSync(allFilePath)) {
		throw new Error(
			"'@material/web' doesn't seem to be installed, please run `npm i` before building."
		);
	}
	const allFileContent = await readFile(allFilePath);

	// Process the elements imports Map
	let imports = findImportsInContent(allFileContent.toString());

	// Lab elements
	imports = imports.concat([
		'./labs/segmentedbuttonset/outlined-segmented-button-set.js',
		'./labs/segmentedbutton/outlined-segmented-button.js',
		'./labs/badge/badge.js',
		'./labs/card/elevated-card.js',
		'./labs/card/filled-card.js',
		'./labs/card/outlined-card.js',
	]);

	const importsMap: ImportsMap = {};

	const elementNameRegex = /\/([^/.]+)\.js/;
	for (const importee of imports) {
		const elementNameMatch = importee.match(elementNameRegex)!;
		importsMap[`md-${elementNameMatch[1]}`] = importee.replace(
			/^\./,
			'@material/web'
		);
	}

	const stringified = JSON.stringify(importsMap, null, 2);

	await writeFile(
		join('src', 'md-elements-imports-map.ts'),
		`
export const MdElementsImportsMap = ${stringified} as const;
/** all available md-* element */
export type MdElement = keyof typeof MdElementsImportsMap;
`.trim() + '\n'
	);
}

await main();
