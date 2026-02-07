import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface PDFGeneratorOptions {
  markdown: string;
  outputPath: string;
}

export async function generatePDF(
  options: PDFGeneratorOptions
): Promise<string> {
  const { markdown, outputPath } = options;

  // Create a temporary markdown file
  const tempDir = os.tmpdir();
  const tempMdPath = path.join(tempDir, `temp-${Date.now()}.md`);

  try {
    // Write markdown to temp file
    await fs.writeFile(tempMdPath, markdown, "utf-8");

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    // Convert markdown to PDF (manus-md-to-pdf CLI if available)
    await execAsync(`manus-md-to-pdf "${tempMdPath}" "${outputPath}"`);

    // Clean up temp file
    try {
      await fs.unlink(tempMdPath);
    } catch (cleanupErr) {
      console.warn("[PDF Generator] Failed to cleanup temp file:", cleanupErr);
    }

    return outputPath;
  } catch (error) {
    // Clean up on error
    try {
      await fs.unlink(tempMdPath);
    } catch {
      // Ignore cleanup errors
    }
    throw error;
  }
}
