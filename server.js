const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { PDFDocument, degrees } = require("pdf-lib");

const app = express();
const port = 3011;
const cors = require("cors");
app.use(cors());


// Recibir directamente el PDF como binario
app.use(express.raw({ type: 'application/pdf', limit: '10mb' }));

app.post("/imprimir-pdf", async (req, res) => {
    if (!req.body || !req.body.length) {
        return res.status(400).send("No PDF enviado");
    }

    try {
        const filePath = path.join(__dirname, "temp.pdf");

        // Guardar PDF directamente
        fs.writeFileSync(filePath, req.body);

        // Rotar si es necesario
        const existingPdfBytes = fs.readFileSync(filePath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const pages = pdfDoc.getPages();

        for (const page of pages) {
            const rotation = page.getRotation().angle;
            if (page.getWidth() > page.getHeight()) {
                page.setRotation(degrees((rotation + 270) % 360));
            }
        }

        const rotatedPdfBytes = await pdfDoc.save();
        fs.writeFileSync(filePath, rotatedPdfBytes);

        // Imprimir con SumatraPDF
        const sumatraPath = `"C:\\Program Files\\SumatraPDF\\SumatraPDF.exe"`;
        const printCommand = `${sumatraPath} -print-to-default -silent -print-settings "noscale" "${filePath}"`;

        exec(printCommand, (error, stdout, stderr) => {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

            if (error) {
                console.error("Error imprimiendo PDF:", error);
                return res.status(500).send("Error imprimiendo PDF");
            }

            res.send("PDF impreso correctamente");
        });
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).send("Error procesando el PDF");
    }
});

app.listen(port, () => {
    console.log(`🖨️ Servidor PDF escuchando en http://localhost:${port}`);
});
