import { promises as fs } from "fs";
import path from "path";
import { mdToPdf } from "md-to-pdf";

export interface PDFGeneratorOptions {
  markdown: string;
  outputPath: string;
}

/** ATS-safe CSS: Arial font, single-column, no tables */
const ATS_SAFE_CSS = `
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; }
  h1, h2, h3, h4 { font-family: Arial, Helvetica, sans-serif; }
  * { max-width: 100%; }
`;

export async function generatePDF(
  options: PDFGeneratorOptions
): Promise<string> {
  const { markdown, outputPath } = options;

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, { recursive: true });

  await mdToPdf(
    { content: markdown },
    {
      dest: outputPath,
      css: ATS_SAFE_CSS,
      pdf_options: {
        format: "Letter",
        margin: {
          top: "0.5in",
          right: "0.5in",
          bottom: "0.5in",
          left: "0.5in",
        },
        printBackground: true,
      },
    }
  );
  return outputPath;
}
