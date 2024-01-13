import {Variant} from './md-icons.js';
import {readFile, writeFile} from 'node:fs/promises';
import {join} from 'path';
import {mkdir} from './utils.js';
import {existsSync} from 'node:fs';

export const CodePointUris: {[key in Variant]: string} = {
	outlined: 'Material+Symbols+Outlined',
	rounded: 'Material+Symbols+Rounded',
	sharp: 'Material+Symbols+Sharp',
} as const;

export async function fetchRawCodepointDocument(variant: Variant) {
	let uri = CodePointUris[variant];
	uri = uri.replaceAll('+', '');
	const url = `https://raw.githubusercontent.com/google/material-design-icons/master/variablefont/${uri}%5BFILL%2CGRAD%2Copsz%2Cwght%5D.codepoints`;
	const res = await fetch(url);
	const text = await res.text();
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
