import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import PDFDocument from "pdfkit";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Set up some mock API routes for the medical lab SaaS
  const logs = [
    { id: 1, type: 'Maintenance', date: '2024-04-25', status: 'Completed', notes: 'Calibrated centrifuge A2.' },
    { id: 2, type: 'Daily Operation', date: '2024-04-26', status: 'Pending', notes: 'Awaiting temperature checks.' }
  ];

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/logs", (req, res) => {
    res.json(logs);
  });

  app.post("/api/logs", (req, res) => {
    const newLog = {
      id: logs.length + 1,
      ...req.body,
    };
    logs.push(newLog);
    res.status(201).json(newLog);
  });

  app.post("/api/export-labels", (req, res) => {
    const { samples } = req.body;

    if (!samples || !Array.isArray(samples)) {
      return res.status(400).json({ error: "Invalid request. 'samples' array is required." });
    }

    try {
      const doc = new PDFDocument({ margin: 30, size: 'A4' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=labels.pdf');

      doc.pipe(res);

      doc.fontSize(20).text('Medical Lab - Sample Labels', { align: 'center' });
      doc.moveDown(2);

      samples.forEach((sample, i) => {
        doc.rect(30, doc.y, 535, 100).stroke();
        doc.fontSize(14).font('Helvetica-Bold').text(`Sample ID: ${sample.localId || 'N/A'}`, 40, doc.y + 10);
        doc.fontSize(12).font('Helvetica').text(`Patient: ${sample.patient || 'N/A'}`, 40, doc.y + 20);
        doc.text(`Type: ${sample.type || 'N/A'}`, 40, doc.y + 15);
        doc.text(`Priority: ${sample.priority || 'N/A'}`, 300, doc.y - 15);
        doc.text(`Time: ${sample.time || 'N/A'}`, 40, doc.y + 15);
        doc.moveDown(3);
      });

      doc.end();
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
