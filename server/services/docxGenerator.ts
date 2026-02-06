import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { promises as fs } from "fs";
import path from "path";
import { marked } from "marked";

export interface DOCXGeneratorOptions {
  markdown: string;
  outputPath: string;
}

// Parse markdown and convert to DOCX paragraphs
function markdownToDocxParagraphs(markdown: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // Parse markdown using marked
  const tokens = marked.lexer(markdown);

  for (const token of tokens) {
    if (token.type === "heading") {
      const level =
        token.depth === 1
          ? HeadingLevel.HEADING_1
          : token.depth === 2
            ? HeadingLevel.HEADING_2
            : token.depth === 3
              ? HeadingLevel.HEADING_3
              : HeadingLevel.HEADING_4;

      paragraphs.push(
        new Paragraph({
          text: token.text,
          heading: level,
        })
      );
    } else if (token.type === "paragraph") {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun(token.text)],
        })
      );
    } else if (token.type === "list") {
      for (const item of token.items) {
        paragraphs.push(
          new Paragraph({
            text: `• ${item.text}`,
            bullet: {
              level: 0,
            },
          })
        );
      }
    } else if (token.type === "space") {
      paragraphs.push(new Paragraph({ text: "" }));
    }
  }

  return paragraphs;
}

export async function generateDOCX(
  options: DOCXGeneratorOptions
): Promise<string> {
  const { markdown, outputPath } = options;

  // Convert markdown to DOCX paragraphs
  const paragraphs = markdownToDocxParagraphs(markdown);

  // Create DOCX document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  // Generate buffer
  const buffer = await Packer.toBuffer(doc);

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, { recursive: true });

  // Write to file
  await fs.writeFile(outputPath, buffer);

  return outputPath;
}
