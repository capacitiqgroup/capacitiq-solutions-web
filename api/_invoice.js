import PDFDocument from "pdfkit";

const TEAL = "#0b4650";
const LIME = "#e6ff2b";
const MUTED = "#4a6670";
const LIGHT = "#e8edf0";

function fmtZAR(cents) { return cents === 0 ? "FREE" : `R${(cents / 100).toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`; }

export function buildInvoicePdf({ orderId, customerName, customerEmail, templates, totalCents }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const bufs = [];
      doc.on("data", (b) => bufs.push(b));
      doc.on("end", () => resolve(Buffer.concat(bufs)));
      doc.on("error", reject);

      const invNum = `INV-${String(orderId).replace(/-/g, "").slice(0, 8).toUpperCase()}`;
      const pageWidth = doc.page.width;
      const margin = 40;

      // Top: INVOICE / logo square
      doc.fillColor(TEAL).font("Helvetica-Bold").fontSize(32).text("INVOICE", margin, 50);
      doc.roundedRect(pageWidth - margin - 70, 45, 60, 60, 12).fillColor(TEAL).fill();
      doc.fillColor(LIME).font("Helvetica-Bold").fontSize(28).text("C", pageWidth - margin - 70, 60, { width: 60, align: "center" });

      doc.fillColor(MUTED).font("Helvetica").fontSize(10).text(`Invoice Number: ${invNum}`, margin, 95);
      doc.text(`Date: ${new Date().toLocaleDateString("en-ZA")}`, margin, 110);

      // Two info boxes
      const boxY = 145;
      const boxH = 110;
      const boxW = (pageWidth - margin * 2 - 16) / 2;
      doc.lineWidth(1).strokeColor(TEAL).roundedRect(margin, boxY, boxW, boxH, 8).stroke();
      doc.fillColor(TEAL).font("Helvetica-Bold").fontSize(10).text("CAPACITIQ SOLUTIONS (PTY) LTD", margin + 12, boxY + 12);
      doc.font("Helvetica").fontSize(9).fillColor(MUTED)
        .text("Trading as: Capacitiq", margin + 12, boxY + 28)
        .text("Reg no: 2026/344156/07", margin + 12, boxY + 42)
        .text("hello@capacitiq.co.za", margin + 12, boxY + 56)
        .text("(064)-062-0354", margin + 12, boxY + 70)
        .text("www.capacitiq.co.za", margin + 12, boxY + 84);

      const rx = margin + boxW + 16;
      doc.strokeColor(TEAL).roundedRect(rx, boxY, boxW, boxH, 8).stroke();
      doc.fillColor(TEAL).font("Helvetica-Bold").fontSize(10).text("BILLED TO", rx + 12, boxY + 12);
      doc.font("Helvetica").fontSize(10).fillColor(MUTED)
        .text(customerName, rx + 12, boxY + 32)
        .text(customerEmail, rx + 12, boxY + 48);

      // Table header
      const tY = boxY + boxH + 28;
      doc.rect(margin, tY, pageWidth - margin * 2, 26).fillColor(LIME).fill();
      doc.fillColor(TEAL).font("Helvetica-Bold").fontSize(10);
      doc.text("Description", margin + 12, tY + 9);
      doc.text("Qty", margin + 260, tY + 9);
      doc.text("Rate", margin + 330, tY + 9);
      doc.text("Total", margin + 430, tY + 9);

      // Rows
      let rowY = tY + 32;
      doc.font("Helvetica").fontSize(10).fillColor(TEAL);
      for (const t of templates) {
        doc.text(t.name, margin + 12, rowY, { width: 240 });
        doc.text("1", margin + 260, rowY);
        doc.text(fmtZAR(t.launch_price), margin + 330, rowY);
        doc.text(fmtZAR(t.launch_price), margin + 430, rowY);
        rowY += 24;
        doc.strokeColor(LIGHT).moveTo(margin, rowY - 6).lineTo(pageWidth - margin, rowY - 6).stroke();
      }

      // Totals
      rowY += 14;
      doc.font("Helvetica").fontSize(10).fillColor(MUTED);
      doc.text("Subtotal", margin + 330, rowY); doc.fillColor(TEAL).text(fmtZAR(totalCents), margin + 430, rowY);
      rowY += 16;
      doc.fillColor(MUTED).text("Shipping", margin + 330, rowY); doc.fillColor(TEAL).text("FREE (Digital)", margin + 430, rowY);
      rowY += 22;
      doc.rect(margin + 320, rowY - 4, pageWidth - margin - (margin + 320), 28).fillColor(LIME).fill();
      doc.fillColor(TEAL).font("Helvetica-Bold").fontSize(12).text("Total", margin + 330, rowY + 4);
      doc.text(fmtZAR(totalCents), margin + 430, rowY + 4);

      // Bottom section
      const bY = Math.max(rowY + 70, doc.page.height - 200);
      doc.lineWidth(1).strokeColor(TEAL).roundedRect(margin, bY, boxW, 90, 8).stroke();
      doc.fillColor(TEAL).font("Helvetica-Bold").fontSize(10).text("BANKING DETAILS", margin + 12, bY + 12);
      doc.font("Helvetica").fontSize(9).fillColor(MUTED)
        .text("Capitec Bank Business Suite", margin + 12, bY + 30)
        .text("Account: 43234545456686", margin + 12, bY + 46)
        .text("Branch: 235000", margin + 12, bY + 62);

      doc.rect(rx, bY, boxW, 44).fillColor(LIME).fill();
      doc.fillColor(TEAL).font("Helvetica-Bold").fontSize(16).text("THANK YOU", rx, bY + 14, { width: boxW, align: "center" });
      doc.strokeColor(TEAL).roundedRect(rx, bY + 52, boxW, 38, 8).stroke();
      doc.fillColor(TEAL).font("Helvetica-Bold").fontSize(10).text("WWW.CAPACITIQ.CO.ZA", rx, bY + 65, { width: boxW, align: "center" });

      doc.end();
    } catch (e) { reject(e); }
  });
}

export function invoiceNumber(orderId) {
  return `INV-${String(orderId).replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}