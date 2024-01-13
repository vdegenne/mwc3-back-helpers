import {mkdir as _mkdir, rm as _rm} from 'node:fs/promises';

export function stripCommentsFromContent(content: string): string {
	const pattern = /\/\/.*|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->/g;
	return content.replace(pattern, '');
}

export async function mkdir(dirpath: string) {
	try {
		await _mkdir(dirpath, {recursive: true});
	} catch (error) {
		console.error(
			`Something went wrong trying to make directory "${dirpath}" (error: ${error})`
		);
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
