export function stripCommentsFromContent(content: string): string {
	const pattern = /\/\/.*|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->/g;
	return content.replace(pattern, '');
}
