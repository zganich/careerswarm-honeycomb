import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export interface ParseResult {
  text: string;
  error?: string;
}

/**
 * Extract text from PDF buffer
 */
export async function parsePDF(buffer: Buffer): Promise<ParseResult> {
  try {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const data = { text: result.text };
    return {
      text: data.text.trim(),
    };
  } catch (error: any) {
    console.error("[PDF Parser] Error:", error.message);
    return {
      text: "",
      error: error.message || "Failed to parse PDF",
    };
  }
}

/**
 * Extract text from DOCX buffer
 */
export async function parseDOCX(buffer: Buffer): Promise<ParseResult> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return {
      text: result.value.trim(),
    };
  } catch (error: any) {
    console.error("[DOCX Parser] Error:", error.message);
    return {
      text: "",
      error: error.message || "Failed to parse DOCX",
    };
  }
}

/**
 * Parse file based on type
 */
export async function parseFile(
  buffer: Buffer,
  fileType: "pdf" | "docx"
): Promise<ParseResult> {
  if (fileType === "pdf") {
    return parsePDF(buffer);
  } else if (fileType === "docx") {
    return parseDOCX(buffer);
  } else {
    return {
      text: "",
      error: `Unsupported file type: ${fileType}`,
    };
  }
}
