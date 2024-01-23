import {mkdir as _mkdir, rm as _rm} from 'node:fs/promises';

export function stripCommentsFromContent(content: string): string {
	const pattern = /(?<!:)\/\/.*|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->/g;
	return content.replace(pattern, '');
}

export async function mkdir(dirpath: string) {
	try {
		await _mkdir(dirpath, {recursive: true});
	} catch (error: any) {
		if (error.code === 'EEXIST') {
		} else {
			console.error(
				`Something went wrong trying to make directory "${dirpath}" (error: ${error})`
			);
		}
	}
}

export async function rm(dirpath: string) {
	try {
		await _rm(dirpath, {force: true, recursive: true});
	} catch (error) {
		console.error(
			`Something went wrong while trying to remove directory "${dirpath}" (error: ${error})`
		);
	}
}

const importsRegex = /import ['"]{1}(.+(\.js)?)['"]{1}/g;

export type ImportsMap = {
	[elementName: string]: string;
};

/**
 * Take a content and returns an array containing
 * all imported paths.
 */
export function findImportsInContent(content: string) {
	const matches = content.matchAll(importsRegex);
	const imports: string[] = [];
	for (const match of matches) {
		imports.push(match[1]);
	}
	return imports;
}
