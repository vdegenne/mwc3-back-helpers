import {stat} from 'node:fs/promises';

export async function getFileSize(filepath: string) {
	try {
		const stats = await stat(filepath);
		return stats.size; // Size of the file in bytes
	} catch (err: any) {
		throw new err();
	}
}
