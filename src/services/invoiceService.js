const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateInvoice = (appointmentDetails) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    // Define the invoice path
    const invoiceDir = path.join(__dirname, "..", "..", "invoices");
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir);
    }
    const invoicePath = path.join(
      invoiceDir,
      `invoice-${appointmentDetails.id}.pdf`
    );
    const writeStream = fs.createWriteStream(invoicePath);

    doc.pipe(writeStream);

    // --- Invoice Header ---
    doc
      .image(
        path.join(__dirname, "..", "public", "images", "logo.png"),
        50,
        45,
        { width: 50 }
      )
      .fontSize(20)
      .text("Sagar's Salon & Spa", 110, 57)
      .fontSize(10)
      .text("123 Beauty Lane", 200, 65, { align: "right" })
      .text("Bengaluru, KA 560001", 200, 80, { align: "right" })
      .moveDown();

    // --- Customer & Invoice Details ---
    const customerName = `${appointmentDetails.user.firstName} ${appointmentDetails.user.lastName}`;
    const invoiceDate = new Date().toLocaleDateString("en-IN");

    doc
      .fontSize(12)
      .text(`Invoice Number: INV-${appointmentDetails.id}`, 50, 160)
      .text(`Invoice Date: ${invoiceDate}`, 50, 175)
      .text(`Billed to: ${customerName}`, 50, 190)
      .moveDown(2);

    // --- Table Header ---
    const tableTop = 250;
    doc
      .fontSize(10)
      .text("Service", 50, tableTop)
      .text("Stylist", 200, tableTop)
      .text("Date & Time", 300, tableTop, { width: 150 })
      .text("Price", 0, tableTop, { align: "right" });

    // --- Table Line ---
    doc
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    // --- Table Row ---
    const itemTop = tableTop + 30;
    const staffName = `${appointmentDetails.staff_profile.user.firstName} ${appointmentDetails.staff_profile.user.lastName}`;
    const appointmentDate = new Date(
      appointmentDetails.appointmentDateTime
    ).toLocaleString("en-IN");

    doc
      .fontSize(10)
      .text(appointmentDetails.service.name, 50, itemTop)
      .text(staffName, 200, itemTop)
      .text(appointmentDate, 300, itemTop, { width: 150 })
      .text(`₹${appointmentDetails.service.price.toFixed(2)}`, 0, itemTop, {
        align: "right",
      });

    // --- Total ---
    const totalTop = itemTop + 50;
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Total:", 400, totalTop)
      .text(`₹${appointmentDetails.service.price.toFixed(2)}`, 0, totalTop, {
        align: "right",
      });

    // --- Footer ---
    doc
      .fontSize(10)
      .text("Thank you for your business!", 50, 700, {
        align: "center",
        width: 500,
      });

    // Finalize the PDF and end the stream
    doc.end();

    writeStream.on("finish", () => {
      resolve(invoicePath);
    });

    writeStream.on("error", (err) => {
      reject(err);
    });
  });
};

module.exports = { generateInvoice };
