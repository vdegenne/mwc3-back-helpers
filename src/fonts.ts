import {Variant} from './md-icons.js';

export const CodePointUris: {[key in Variant]: string} = {
	Outlined: 'Material+Symbols+Outlined',
	Rounded: 'Material+Symbols+Rounded',
	Sharp: 'Material+Symbols+Sharp',
} as const;

export const test = Variant.SHARP;

/**
 * Map that binds icon names to their equivalent codepoint.
 */

//
// export async function fetchCodepointDocument(variant: Variant) {
// 	const uri = CodePointUris[variant];
// 	const res = await fetch(
// 		`https://raw.githubusercontent.com/google/material-design-icons/master/variablefont/${uri.replaceAll(
// 			'+',
// 			''
// 		)}%5BFILL%2CGRAD%2Copsz%2Cwght%5D.codepoints`
// 	);
// 	const text = await res.text();
// 	return text;
// }
