import {expect} from 'chai';
import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {
	codePointDocumentExists,
	createCodePointsMapFromDocument,
	downloadCodePointDocuments,
	downloadSymbolsFontFromStyleSheet,
	fetchAllRawCodePointDocuments,
	loadOrDownloadCodePointDocuments,
	removeMaterialSymbolsLinkFromHtml,
	replaceMaterialSymbolsLinkInHtml,
} from '../fonts.js';
import {Variant} from '../md-icons.js';
import {rm} from '../utils.js';
import {getFileSize} from './utils.js';
import {
	constructSymbolsFontStyleSheetUrl,
	downloadSymbolsFontStyleSheet,
	extractSymbolsFontUrlFromStyleSheet,
	fetchSymbolsFontStyleSheet,
	loadOrDownloadSymbolsFontStyleSheet,
	replaceSymbolsFontUrlInStyleSheet,
} from '../stylesheet/stylesheet.js';

describe('fonts.ts module', () => {
	// Uncomment/Comment this set of tests every now and then
	// to force fetching fresh codepoint documents / to avoid
	// sending a request to Google server on every changes.
	// Subsequent tests will be using a locally saved version
	// of the documents.
	describe.skip('Pre-fetching', () => {
		const destination = '.mdicon'; // default
		beforeEach(async () => {
			await rm(destination);
		});

		it('fetches codepoint documents', async () => {
			const docs = await fetchAllRawCodePointDocuments();

			// Are the codepoint documents the same?
			expect(docs.outlined).to.equal(docs.rounded);
			expect(docs.rounded).to.equal(docs.sharp);
			// Yes, it seems like
			// By deduction outlined = sharp
		});

		it('downloads codepoint documents', async () => {
			expect(existsSync(destination)).to.be.false;
			await downloadCodePointDocuments({destination});
			expect(existsSync(destination)).to.be.true;
			expect(
				codePointDocumentExists(Variant.OUTLINED, {destination}) &&
					codePointDocumentExists(Variant.ROUNDED, {destination}) &&
					codePointDocumentExists(Variant.SHARP, {destination})
			).to.be.true;
		});

		it('loads locally or downloads', async () => {
			expect(existsSync(destination)).to.be.false;
			let result = await loadOrDownloadCodePointDocuments({
				destination,
			});
			let downloaded = result.downloaded;
			let documents = result.documents;

			expect(downloaded).to.be.true;

			expect(existsSync(destination)).to.be.true;
			expect(
				codePointDocumentExists(Variant.OUTLINED, {destination}) &&
					codePointDocumentExists(Variant.ROUNDED, {destination}) &&
					codePointDocumentExists(Variant.SHARP, {destination})
			).to.be.true;
			expect(Object.keys(documents)).to.deep.equal([
				Variant.OUTLINED,
				Variant.ROUNDED,
				Variant.SHARP,
			]);

			expect(documents.sharp).to.contains('10k e951');

			result = await loadOrDownloadCodePointDocuments({
				destination,
			});
			downloaded = result.downloaded;
			documents = result.documents;

			expect(downloaded).to.be.false;
			expect(existsSync(destination)).to.be.true;
			expect(
				codePointDocumentExists(Variant.OUTLINED, {destination}) &&
					codePointDocumentExists(Variant.ROUNDED, {destination}) &&
					codePointDocumentExists(Variant.SHARP, {destination})
			).to.be.true;
			expect(Object.keys(documents)).to.deep.equal([
				Variant.OUTLINED,
				Variant.ROUNDED,
				Variant.SHARP,
			]);

			expect(documents.sharp).to.contains('10k e951');
		});
	});

	it('creates codepoints map from document', async () => {
		const {documents} = await loadOrDownloadCodePointDocuments();
		const map = createCodePointsMapFromDocument(documents.outlined);
		expect(map['10k']).to.equal('e951');
	});

	it('constructs symbols font stylesheet url', () => {
		let url = constructSymbolsFontStyleSheetUrl(Variant.OUTLINED, ['efd1']);
		expect(url).to.equal(
			'https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined&text=%EE%BF%91'
		);

		url = constructSymbolsFontStyleSheetUrl(Variant.SHARP, [
			'e71c',
			'f888',
			'e8cd',
		]);
		expect(url).to.equal(
			'https://fonts.googleapis.com/icon?family=Material+Symbols+Sharp&text=%EE%9C%9C%EF%A2%88%EE%A3%8D'
		);
	});

	describe('Material Symbols Stylesheet/Font helpers', () => {
		const stylesheetPath = '.mdicon/material-symbols.css';

		describe.skip('Pre-fetching', () => {
			beforeEach(async () => {
				await rm('.mdicon/material-symbols.css');
			});

			it('fetches symbols font stylesheet from url', async () => {
				const stylesheet = await fetchSymbolsFontStyleSheet(Variant.ROUNDED, [
					'e71c',
					'f888',
					'e8cd',
				]);
				expect(stylesheet).to.contain('@font-face {');
				expect(stylesheet).to.contain('Material Symbols Rounded');
			});

			it('downloads symbols font stylesheet', async () => {
				expect(existsSync(stylesheetPath)).to.be.false;
				const stylesheet = await downloadSymbolsFontStyleSheet(
					Variant.OUTLINED,
					['e71c', 'f888', 'e8cd']
				);
				expect(existsSync(stylesheetPath)).to.be.true;
				const fileContent = (await readFile(stylesheetPath)).toString();
				expect(fileContent).to.equal(stylesheet);
			});

			it('loads locally or downloads', async () => {
				expect(existsSync(stylesheetPath)).to.be.false;
				const {downloaded, stylesheet} =
					await loadOrDownloadSymbolsFontStyleSheet(
						stylesheetPath,
						Variant.OUTLINED,
						['e71c', 'f888', 'e8cd']
					);
				expect(downloaded).to.be.true;
				expect(stylesheet).to.contain('@font-face {');

				const {downloaded: redownloaded, stylesheet: restylesheet} =
					await loadOrDownloadSymbolsFontStyleSheet(
						stylesheetPath,
						Variant.OUTLINED,
						['e71c', 'f888', 'e8cd']
					);
				expect(redownloaded).to.be.false;
				expect(restylesheet).to.contain('@font-face {');
				expect(restylesheet).to.equal(stylesheet);
			});
		});

		it('extracts Symbols font url from stylesheet', async () => {
			const {stylesheet} = await loadOrDownloadSymbolsFontStyleSheet(
				stylesheetPath,
				Variant.OUTLINED,
				[]
			);
			const fontUrl = extractSymbolsFontUrlFromStyleSheet(stylesheet);
			expect(fontUrl).to.equal(
				'https://fonts.gstatic.com/s/materialsymbolsoutlined/v156/kJEhBvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oFsI.woff2'
			);
		});

		it('replaces Symbols font url with an input', async () => {
			const {stylesheet} = await loadOrDownloadSymbolsFontStyleSheet(
				stylesheetPath,
				Variant.OUTLINED,
				[]
			);
			const output = replaceSymbolsFontUrlInStyleSheet(
				stylesheet,
				'./another/uri/to/font.woff'
			);
			expect(output).to.contain('url(./another/uri/to/font.woff)');
		});

		describe.skip('Font Download', () => {
			const fontPath = '.mdicon/material-symbols.woff2';
			beforeEach(async () => {
				await rm(fontPath);
			});
			after(async () => {
				await rm(fontPath);
			});

			it('downloads font file from stylesheet', async () => {
				const {stylesheet} = await loadOrDownloadSymbolsFontStyleSheet(
					stylesheetPath,
					Variant.OUTLINED,
					[]
				);

				expect(existsSync(fontPath)).to.be.false;
				const fontUrl = await downloadSymbolsFontFromStyleSheet(stylesheet, {
					filepath: fontPath,
				});
				expect(fontUrl).to.equal(
					'https://fonts.gstatic.com/s/materialsymbolsoutlined/v156/kJEhBvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oFsI.woff2'
				);
				expect(existsSync(fontPath)).to.be.true;
			});

			it('downloads font file containing only provided icons', async () => {
				const ss1 = await fetchSymbolsFontStyleSheet(Variant.OUTLINED, [
					'eb8d',
				]);
				await downloadSymbolsFontFromStyleSheet(ss1, {filepath: fontPath});
				const size1 = await getFileSize(fontPath);

				const ss2 = await fetchSymbolsFontStyleSheet(Variant.OUTLINED, [
					'eb8d',
					'e577',
					'e952',
					'e956',
					'e981',
				]);
				await downloadSymbolsFontFromStyleSheet(ss2, {filepath: fontPath});
				const size2 = await getFileSize(fontPath);

				expect(size1).to.be.lessThan(1700);
				expect(size2).to.be.greaterThan(1700);
				expect(size2).to.be.lessThan(6000);
			});
		});
	});
	describe('HTML transformation', () => {
		const html = `
    <!doctype html>
    <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">
      </head>
    </html>
`;

		it('replaces Material Symbols link', () => {
			const output = replaceMaterialSymbolsLinkInHtml(
				html,
				'<link rel="stylesheet" href="./my/stylesheet.css">'
			);
			expect(output).to.equal(`
    <!doctype html>
    <html>
      <head>
        <link rel="stylesheet" href="./my/stylesheet.css">
      </head>
    </html>
`);
		});

		it('removes Material Symbols link', async () => {
			const output = removeMaterialSymbolsLinkFromHtml(html);
			expect(output).to.equal(`
    <!doctype html>
    <html>
      <head>
        
      </head>
    </html>
`);
		});
	});
});
