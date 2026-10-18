import { jsPDF } from 'jspdf';

export interface PrintableSample {
  localId: string;
  patient: string;
  type: string;
  priority: string;
}

export function buildLabelPdf(samples: PrintableSample[]) {
  if (!samples.length) throw new Error('Select at least one sample.');
  const pdf = new jsPDF({ unit: 'mm', format: [101.6, 50.8], orientation: 'landscape' });
  samples.forEach((sample, index) => {
    if (index) pdf.addPage([101.6, 50.8], 'landscape');
    pdf.setFontSize(8);
    pdf.text('AURA LABS / DEMO SAMPLE - NOT FOR CLINICAL USE', 5, 7);
    pdf.setFontSize(12);
    pdf.text(String(sample.localId).slice(0, 42), 5, 17);
    pdf.setFontSize(9);
    pdf.text(pdf.splitTextToSize(`Name: ${sample.patient}`, 90).slice(0, 2), 5, 24);
    pdf.text(String(sample.type).slice(0, 48), 5, 36);
    pdf.text(`Priority: ${sample.priority}`, 5, 43);
  });
  return pdf;
}
