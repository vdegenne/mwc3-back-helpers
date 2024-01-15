import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {readFile, writeFile} from 'node:fs/promises';
import {findImportsInContent, type ImportsMap} from '../src/imports.ts';

const allFilePath = join('node_modules', '@material', 'web', 'all.js');

async function main() {
	if (!existsSync(allFilePath)) {
		throw new Error(
			"'@material/web' doesn't seem to be installed, please run `npm i` before building."
		);
	}
	const allFileContent = await readFile(allFilePath);

	// Process the elements imports Map
	const imports = findImportsInContent(allFileContent.toString());
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
export const MdElementsImportsMap = ${stringified};
/** all available md-* element */
export type MdElement = keyof typeof MdElementsImportsMap;
`.trim() + '\n'
	);
}

await main();
