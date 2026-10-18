import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { buildLabelPdf } from './src/label-pdf';
assert.throws(() => buildLabelPdf([]), /Select at least/);
const samples = [
  { localId: 'DEMO-A1', patient: 'Demo Sample One', type: 'Blood - EDTA', priority: 'Routine' },
  { localId: 'DEMO-B2', patient: 'Demo Sample Two', type: 'Serum', priority: 'STAT' },
];
const pdf = buildLabelPdf(samples);
assert.equal(pdf.getNumberOfPages(), 2);
assert.ok(Math.abs(pdf.internal.pageSize.getWidth() - 101.6) < 0.1);
assert.ok(Math.abs(pdf.internal.pageSize.getHeight() - 50.8) < 0.1);
const bytes = Buffer.from(pdf.output('arraybuffer'));
assert.equal(bytes.subarray(0, 5).toString(), '%PDF-');
writeFileSync('label-export-check.pdf', bytes);
console.log('PDF signature, two pages, 4x2 dimensions and empty-selection validation passed.');
