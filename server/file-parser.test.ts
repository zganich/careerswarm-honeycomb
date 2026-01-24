import { describe, it, expect } from "vitest";
import { parsePDF, parseDOCX, parseFile } from "./file-parser";

describe("File Parser", () => {
  describe("parsePDF", () => {
    it("should return error for empty buffer", async () => {
      const result = await parsePDF(Buffer.from(""));
      expect(result.text).toBe("");
      expect(result.error).toBeDefined();
    });

    it("should return error for invalid PDF", async () => {
      const result = await parsePDF(Buffer.from("not a pdf"));
      expect(result.text).toBe("");
      expect(result.error).toBeDefined();
    });
  });

  describe("parseDOCX", () => {
    it("should return error for empty buffer", async () => {
      const result = await parseDOCX(Buffer.from(""));
      expect(result.text).toBe("");
      expect(result.error).toBeDefined();
    });

    it("should return error for invalid DOCX", async () => {
      const result = await parseDOCX(Buffer.from("not a docx"));
      expect(result.text).toBe("");
      expect(result.error).toBeDefined();
    });
  });

  describe("parseFile", () => {
    it("should route to PDF parser for pdf type", async () => {
      const result = await parseFile(Buffer.from(""), "pdf");
      expect(result.error).toBeDefined();
    });

    it("should route to DOCX parser for docx type", async () => {
      const result = await parseFile(Buffer.from(""), "docx");
      expect(result.error).toBeDefined();
    });

    it("should return error for unsupported file type", async () => {
      const result = await parseFile(Buffer.from(""), "txt" as any);
      expect(result.text).toBe("");
      expect(result.error).toContain("Unsupported file type");
    });
  });
});
