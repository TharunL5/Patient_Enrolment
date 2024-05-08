import express from "express";
import { PDFDocument, PDFRadioGroup } from "pdf-lib"; // Import PDFRadioGroup
import fs from "fs/promises";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// Load PDF template with form fields
async function loadPdfTemplate() {
  try {
    const pdfBytes = await fs.readFile("D:\\Placement\\pdf_test\\server\\inputpdf.pdf");
    const pdfDoc = await PDFDocument.load(pdfBytes);
    return pdfDoc;
  } catch (error) {
    console.error("Error loading PDF template:", error);
    throw error;
  }
}

app.post("/generatePdf", async (req, res) => {
  const { formData } = req.body;

  try {
    // Load the PDF template
    const pdfDoc = await loadPdfTemplate();

    // Access the form fields
    const form = pdfDoc.getForm();

    // Set values for each field based on user input
    for (const fieldName in formData) {
      const field = form.getField(fieldName);
      if (field) {
        const value = formData[fieldName];
        if (value !== undefined && value !== null) {
          if (field instanceof PDFCheckBox) {
            // Handle checkboxes
            field.check();
          } else if (field instanceof PDFTextField) {
            // Handle text fields
            field.setText(value.toString());
          } else if (field instanceof PDFDateField) {
            // Handle date fields
            const [year, month, day] = value.split('-');
            field.setDate(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
          } else if (field instanceof PDFRadioGroup) {
            // Handle radio buttons
            field.select(value); // Set the selected radio button in the group
          }
        }
      }
    }

    // Save the modified PDF document
    const pdfBytes = await pdfDoc.save();
    await fs.writeFile("output.pdf", pdfBytes);

    res.status(200).send("PDF generated successfully");
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
