/**
 * Helpers to load/download customized stylesheets from fonts.googleapis.com
 * The stylesheet contains a Material Symbols font file used to display
 * icons in `<md-icon>` element.
 */
import {existsSync} from 'node:fs';
import {readFile, writeFile} from 'node:fs/promises';
import {dirname} from 'node:path';
import {type CodePoint} from '../codepoints-maps.js';
import {FontFamilies} from '../fonts.js';
import {type Variant} from '../md-icons.js';
import {mkdir} from '../utils.js';

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
	const family = FontFamilies[variant];
	let text = codepoints.length ? '&text=' : '';
	codepoints.forEach((codepoint) => {
		text += encodeURIComponent(String.fromCharCode(parseInt(codepoint, 16)));
	});

	// Following link kept for historical reason
	// return `https://fonts.googleapis.com/icon?family=${family}${text}`;
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

/**
 * Replace the url entry inside the given stylesheet.
 * This function is used when localizing a stylesheet and
 * a font fetched remotely.
 */
export function replaceSymbolsFontUrlInStyleSheet(
	stylesheet: string,
	replaceWith: string
) {
	const regex = /url\(([^)]+)\)/;
	return stylesheet.replace(regex, (_, _url) => {
		return `url(${replaceWith})`;
	});
}
