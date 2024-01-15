/**
 * This file is very similar to ../src/fonts.ts
 * and should be considered final.
 * It is used by the script `generate-codepoints-docs.ts`
 * isolated from other scripts that may imports object
 * that this script is pretending to generate (bad loop).
 */
import {existsSync} from 'node:fs';
import {readFile, writeFile} from 'node:fs/promises';
import {join, dirname} from 'node:path';
import {mkdir} from '../src/utils.js';

export enum Variant {
	OUTLINED = 'outlined',
	ROUNDED = 'rounded',
	SHARP = 'sharp',
}
export type CodePointsMapType = {[iconName: string]: string};

const FontFamily = {
	outlined: 'Material+Symbols+Outlined',
	rounded: 'Material+Symbols+Rounded',
	sharp: 'Material+Symbols+Sharp',
} as const;
export type FontFamilyValue = (typeof FontFamily)[keyof typeof FontFamily];
export const FontFamilies: {[key in Variant]: FontFamilyValue} = {
	outlined: FontFamily.outlined,
	rounded: FontFamily.rounded,
	sharp: FontFamily.sharp,
};

export async function fetchRawCodepointDocument(variant: Variant) {
	const _family: FontFamilyValue = FontFamilies[variant];
	const family = _family.replace(/\+/g, '');
	const url = `https://raw.githubusercontent.com/google/material-design-icons/master/variablefont/${family}%5BFILL%2CGRAD%2Copsz%2Cwght%5D.codepoints`;
	const response = await fetch(url);
	const text = await response.text();
	return text;
}

/**
 * Fetch all variant codepoints documents as-is.
 */
export async function fetchAllRawCodePointDocuments() {
	const docs: {[key in Variant]: Promise<string> | string} = {
		outlined: fetchRawCodepointDocument(Variant.OUTLINED),
		rounded: fetchRawCodepointDocument(Variant.ROUNDED),
		sharp: fetchRawCodepointDocument(Variant.SHARP),
	};

	await Promise.all(Object.values(docs));

	docs.outlined = await docs.outlined;
	docs.rounded = await docs.rounded;
	docs.sharp = await docs.sharp;

	return docs as {[key in Variant]: string};
}

/**
 * Fetch and save all variant codepoints documents on the file system
 *
 * @returns A map with 3 variants codepoints documents
 */
export async function downloadCodePointDocuments(
	options: {destination?: string} = {}
) {
	options.destination ??= '.mdicon';
	const docs = await fetchAllRawCodePointDocuments();

	// Make sure the dirname exists
	await mkdir(options.destination);

	for (const [variant, content] of Object.entries(docs)) {
		await saveCodePointDocument(content, variant as Variant, options);
	}

	return docs;
}

/**
 * Attempts to load the codepoints documents locally if the files exists
 * else they are downloaded, saved on the local file system and returned
 * by the function.
 */
export async function loadOrDownloadCodePointDocuments(
	options: {destination?: string} = {}
) {
	options.destination ??= '.mdicon';

	let documents: {[key in Variant]: string} | undefined;
	let downloaded = false;

	// Check local availability
	if (
		codePointDocumentExists(Variant.OUTLINED) &&
		codePointDocumentExists(Variant.ROUNDED) &&
		codePointDocumentExists(Variant.SHARP)
	) {
		documents = {
			outlined: await loadCodePointDocument(Variant.OUTLINED),
			rounded: await loadCodePointDocument(Variant.ROUNDED),
			sharp: await loadCodePointDocument(Variant.SHARP),
		};
	} else {
		documents = await downloadCodePointDocuments(options);
		downloaded = true;
	}

	return {
		/** false if document was loaded locally, true if it was downloaded remotely */
		downloaded,
		/** codepoint documents for each variant */
		documents,
	};
}

export async function saveCodePointDocument(
	content: string,
	variant: Variant,
	options: {destination?: string} = {}
) {
	options.destination ??= '.mdicon';
	await writeFile(join(options.destination, `${variant}.codepoints`), content);
}

export async function loadCodePointDocument(
	variant: Variant,
	options: {destination?: string} = {}
) {
	options.destination ??= '.mdicon';
	return (
		await readFile(join(options.destination, `${variant}.codepoints`))
	).toString();
}

export function codePointDocumentExists(
	variant: Variant,
	options: {destination?: string} = {}
) {
	options.destination ??= '.mdicon';
	try {
		return existsSync(join(options.destination, `${variant}.codepoints`));
	} catch (error) {
		console.error(
			`Error trying to check file existence "${variant}.codepoints" (error: ${error})`
		);
	}
}

/**
 * Take a content representing the document and returns a codepoints map.
 */
export function createCodePointsMapFromDocument(
	document: string
): CodePointsMapType {
	return Object.fromEntries(
		document.split('\n').map((line) => line.split(' '))
	);
}
