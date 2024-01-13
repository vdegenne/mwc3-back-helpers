/**
 * This script will load locally or download remotely the 3 codepoint documents
 * and will generate the maps used in the sources out of these documents.
 */
import {
	createCodePointsMapFromDocument,
	loadOrDownloadCodePointDocuments,
} from '../src/fonts.js';
import {writeFile} from 'node:fs/promises';
import {join} from 'node:path';

async function main() {
	const {documents} = await loadOrDownloadCodePointDocuments();

	const OutlinedCodePointsMap = createCodePointsMapFromDocument(
		documents.outlined
	);
	const RoundedCodePointsMap = createCodePointsMapFromDocument(
		documents.rounded
	);
	const SharpCodePointsMap = createCodePointsMapFromDocument(documents.sharp);

	await writeFile(
		join('src', 'codepoints-maps.ts'),
		`export const OutlinedCodePointsMap = ${JSON.stringify(
			OutlinedCodePointsMap
		)};
export const RoundedCodePointsMap = ${JSON.stringify(RoundedCodePointsMap)};
export const SharpCodePointsMap = ${JSON.stringify(SharpCodePointsMap)};
`
	);
}

await main();
