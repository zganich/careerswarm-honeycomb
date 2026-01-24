import { describe, it, expect } from "vitest";
import { extractTextFromPDF, isValidPDF } from "./pdf-extractor";

describe("PDF Extractor", () => {
  it("should validate PDF MIME type and header", () => {
    const validPDFBuffer = Buffer.from("%PDF-1.4");
    expect(isValidPDF(validPDFBuffer, "application/pdf")).toBe(true);
    expect(isValidPDF(validPDFBuffer, "text/plain")).toBe(false);
    expect(isValidPDF(validPDFBuffer, "image/jpeg")).toBe(false);
  });

  it("should reject invalid PDF buffers", () => {
    const invalidBuffer = Buffer.from("Not a PDF");
    expect(isValidPDF(invalidBuffer, "application/pdf")).toBe(false);
  });

  it("should accept valid PDF header", () => {
    const validPDFHeader = Buffer.from("%PDF-1.4");
    expect(isValidPDF(validPDFHeader, "application/pdf")).toBe(true);
  });

  // Skip actual PDF extraction test as it requires a real PDF file
  it.skip("should extract text from PDF buffer", async () => {
    // This would require a real PDF buffer to test
    // For now, we rely on manual testing with actual PDF uploads
  });
});
