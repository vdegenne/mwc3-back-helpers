import {Variant} from './md-icons.js';
import {existsSync} from 'node:fs';
import {readFile, writeFile} from 'node:fs/promises';
import {join, dirname} from 'node:path';
import {mkdir} from './utils.js';
import type {CodePoint} from './codepoints-maps.js';

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
	const family = _family.replaceAll('+', '');
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

/**
 * Construct a URL pointing to a stylesheet that
 * encapsulates the Symbols font which includes only the
 * codepoints provided in the arguments.
 *
 * `extractSymbolsFontUrlFromStyleSheet` can then be used
 * to get the fonts location from the stylesheet's content.
 */
export function constructSymbolsFontStyleSheetUrl(
	variant: Variant,
	codepoints: CodePoint[] = []
) {
	let text = codepoints.length ? '&text=' : '';
	const family = FontFamilies[variant];

	codepoints.forEach((codepoint) => {
		text += encodeURIComponent(String.fromCharCode(parseInt(codepoint, 16)));
	});

	return `https://fonts.googleapis.com/css2?family=${family}:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200${text}`;
}

export async function fetchSymbolsFontStyleSheet(
	variant: Variant,
	codepoints: CodePoint[]
) {
	const options = {
		method: 'GET',
		headers: {
			'User-Agent':
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36', // Mimic a Chrome browser user agent
			'Accept-Language': 'en-US,en;q=0.9',
		},
	};
	try {
		const response = await fetch(
			constructSymbolsFontStyleSheetUrl(variant, codepoints),
			options
		);
		return await response.text();
	} catch (error: any) {
		throw new Error(
			`Something went wrong while trying to fetch Material Symbols stylesheet (error: ${error.message})`
		);
	}
}

export async function downloadSymbolsFontStyleSheet(
	variant: Variant,
	codepoints: CodePoint[],
	options: {
		/**
		 * The filepath where to save the Stylesheet
		 *
		 * @default '.mdicon/material-symbols.css'
		 */
		filepath: string;
	} = {
		filepath: '.mdicon/material-symbols.css',
	}
) {
	try {
		const text = await fetchSymbolsFontStyleSheet(variant, codepoints);
		// Make sure the dirname exists
		const dirpath = dirname(options.filepath);
		if (!existsSync(dirpath)) {
			await mkdir(dirpath);
		}
		await writeFile(options.filepath, text);
		return text;
	} catch (error: any) {
		throw new Error(
			`Something went wrong while trying to download Material Symbols Stylesheet (error: ${error.message})`
		);
	}
}

/**
 * Attempts to load stylesheet locally first,
 * downloads remotely, saves, returns otherwise
 */
export async function loadOrDownloadSymbolsFontStyleSheet(
	filepath: string,
	variant: Variant,
	codepoints: CodePoint[]
) {
	let downloaded = false;
	let stylesheet: string | undefined;
	if (existsSync(filepath)) {
		stylesheet = (await readFile(filepath)).toString();
	} else {
		stylesheet = await downloadSymbolsFontStyleSheet(variant, codepoints, {
			filepath,
		});
		downloaded = true;
	}
	return {
		downloaded,
		stylesheet,
	};
}

export function extractSymbolsFontUrlFromStyleSheet(stylesheet: string) {
	const regex = /url\(([^)]+)\)/;
	const match = stylesheet.match(regex);
	return match?.[1];
}

export function replaceSymbolsFontUrlInStyleSheet(
	stylesheet: string,
	replaceWith: string
) {
	const regex = /url\(([^)]+)\)/;
	return stylesheet.replace(regex, (_, _url) => {
		return `url(${replaceWith})`;
	});
}

export async function downloadSymbolsFontFromStyleSheet(
	stylesheet: string,
	options: {
		/**
		 * Filepath to where to save the font file.
		 *
		 * @default '.mdicon/material-symbols.woff2'
		 */
		filepath: string;
	} = {
		filepath: '.mdicon/material-symbols.woff2',
	}
) {
	const fontUrl = extractSymbolsFontUrlFromStyleSheet(stylesheet);
	if (fontUrl == undefined) {
		throw new Error(
			"The font url couldn't be determined from the provided stylesheet."
		);
	}
	try {
		const response = await fetch(fontUrl);
		await writeFile(
			options.filepath,
			Buffer.from(await response.arrayBuffer())
		);
		return fontUrl;
	} catch (error: any) {
		throw new Error(
			`Something went wrong while trying to save font file (error: ${error.message})`
		);
	}
}
