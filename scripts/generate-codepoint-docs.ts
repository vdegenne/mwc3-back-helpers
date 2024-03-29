/**
 * This script will load locally or download remotely the 3 codepoint documents
 * and will generate the maps used in the sources out of these documents.
 */
import {
	createCodePointsMapFromDocument,
	loadOrDownloadCodePointDocuments,
} from './codepoints-docs.js';
import {writeFile} from 'node:fs/promises';
import {join} from 'node:path';

async function main() {
	const {documents} = await loadOrDownloadCodePointDocuments();

	const outlinedCodePointsMap = JSON.stringify(
		createCodePointsMapFromDocument(documents.outlined)
	);
	const roundedCodePointsMap = JSON.stringify(
		createCodePointsMapFromDocument(documents.rounded)
	);
	const sharpCodePointsMap = JSON.stringify(
		createCodePointsMapFromDocument(documents.sharp)
	);

	await writeFile(
		join('src', 'codepoints-maps.ts'),
		`
export const OutlinedCodePointsMap = ${outlinedCodePointsMap} as const;
export const RoundedCodePointsMap = ${roundedCodePointsMap} as const;
export const SharpCodePointsMap = ${sharpCodePointsMap} as const;
/** General code points map */
export const CodePointsMap = ${outlinedCodePointsMap} as const;
export type MdIconName = keyof typeof CodePointsMap;
export type CodePoint =
	| (typeof OutlinedCodePointsMap)[keyof typeof OutlinedCodePointsMap]
	| (typeof RoundedCodePointsMap)[keyof typeof RoundedCodePointsMap]
	| (typeof SharpCodePointsMap)[keyof typeof SharpCodePointsMap];
`.trim() + '\n'
	);
}

await main();
