import {expect} from 'chai';
import {
	codePointDocumentExists,
	downloadCodePointDocuments,
	loadOrDownloadCodePointDocuments,
	fetchAllRawCodePointDocuments,
} from '../fonts.js';
import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {rm} from '../utils.js';
import {Variant} from '../md-icons.js';

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
});
