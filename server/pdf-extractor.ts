/**
 * Extract text content from a PDF buffer
 * @param buffer - PDF file buffer
 * @returns Extracted text content
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Use dynamic import for pdf-parse (CommonJS module)
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text;
  } catch (error) {
    console.error("PDF extraction failed:", error);
    throw new Error("Failed to extract text from PDF. Please ensure the file is a valid PDF.");
  }
}

/**
 * Validate if a file is a PDF based on MIME type and magic bytes
 * @param buffer - File buffer
 * @param mimeType - MIME type from upload
 * @returns true if valid PDF
 */
export function isValidPDF(buffer: Buffer, mimeType?: string): boolean {
  // Check MIME type
  if (mimeType && mimeType !== "application/pdf") {
    return false;
  }

  // Check PDF magic bytes (%PDF-)
  if (buffer.length < 5) {
    return false;
  }

  const header = buffer.toString("utf-8", 0, 5);
  return header === "%PDF-";
}
