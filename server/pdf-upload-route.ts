import { Router } from "express";
import multer from "multer";
import { extractTextFromPDF, isValidPDF } from "./pdf-extractor";

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

export function createPDFUploadRouter() {
  const router = Router();

  router.post("/api/upload-pdf", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Validate PDF
      if (!isValidPDF(req.file.buffer, req.file.mimetype)) {
        return res.status(400).json({ error: "Invalid PDF file" });
      }

      // Extract text
      const text = await extractTextFromPDF(req.file.buffer);

      if (!text || text.trim().length < 50) {
        return res.status(400).json({ 
          error: "Could not extract enough text from PDF. Please ensure the PDF contains text (not just images)." 
        });
      }

      // Return extracted text
      res.json({ 
        text,
        characterCount: text.length,
        wordCount: text.split(/\s+/).filter(Boolean).length,
      });
    } catch (error) {
      console.error("PDF upload error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to process PDF" 
      });
    }
  });

  return router;
}
