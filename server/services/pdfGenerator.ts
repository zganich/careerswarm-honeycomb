// @ts-ignore - no types available for markdown-pdf
import markdownpdf from 'markdown-pdf';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

export interface PDFGeneratorOptions {
  markdown: string;
  outputPath: string;
}

export async function generatePDF(options: PDFGeneratorOptions): Promise<string> {
  const { markdown, outputPath } = options;

  // Create a temporary markdown file
  const tempDir = os.tmpdir();
  const tempMdPath = path.join(tempDir, `temp-${Date.now()}.md`);
  
  try {
    // Write markdown to temp file
    await fs.writeFile(tempMdPath, markdown, 'utf-8');

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    // Convert markdown to PDF (cleanup temp file only after conversion completes)
    return new Promise((resolve, reject) => {
      markdownpdf()
        .from(tempMdPath)
        .to(outputPath, async (err: Error | null) => {
          try {
            await fs.unlink(tempMdPath);
          } catch {
            // Ignore cleanup errors
          }
          if (err) {
            reject(err);
          } else {
            resolve(outputPath);
          }
        });
    });
  } catch (e) {
    try {
      await fs.unlink(tempMdPath);
    } catch {
      // ignore
    }
    throw e;
  }
}
