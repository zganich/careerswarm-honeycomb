import express, { Request, Response } from "express";
import multer from "multer";
import { parseFile } from "./file-parser";
import { createSourceMaterial } from "./db";
import { sdk } from "./_core/sdk";

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and DOCX files are allowed"));
    }
  },
});

interface UploadResult {
  success: boolean;
  fileName: string;
  id?: number;
  error?: string;
}

/**
 * POST /api/ingest/file
 * Upload and parse resume files (PDF/DOCX)
 */
router.post("/", upload.array("files", 10), async (req: Request, res: Response) => {
  try {
    // Get authenticated user
    const user = await sdk.authenticateRequest(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if files were uploaded
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Process each file
    const results: UploadResult[] = [];
    
    for (const file of files) {
      try {
        // Determine file type
        const fileType = file.mimetype === "application/pdf" ? "pdf" : "docx";
        
        // Parse file
        const parseResult = await parseFile(file.buffer, fileType);
        
        // Check for parsing errors
        if (parseResult.error || !parseResult.text) {
          results.push({
            success: false,
            fileName: file.originalname,
            error: parseResult.error || "Failed to extract text from file",
          });
          continue;
        }

        // Check if text is too short (likely corrupted or empty)
        if (parseResult.text.length < 50) {
          results.push({
            success: false,
            fileName: file.originalname,
            error: "File appears to be empty or corrupted (extracted text too short)",
          });
          continue;
        }

        // Calculate word count
        const wordCount = parseResult.text.split(/\s+/).length;

        // Save to database
        const id = await createSourceMaterial({
          userId: user.id,
          type: "FILE",
          title: file.originalname,
          content: parseResult.text,
          metadata: {
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            wordCount,
          },
        });

        results.push({
          success: true,
          fileName: file.originalname,
          id,
        });
      } catch (error: any) {
        console.error(`[Ingest File] Error processing file ${file.originalname}:`, error);
        results.push({
          success: false,
          fileName: file.originalname,
          error: error.message || "Failed to process file",
        });
      }
    }

    // Return results
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return res.status(200).json({
      success: successCount > 0,
      message: `Processed ${files.length} files: ${successCount} successful, ${failureCount} failed`,
      results,
    });
  } catch (error: any) {
    console.error("[Ingest File] Unexpected error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

export default router;
