import archiver from 'archiver';
import { createWriteStream } from 'fs';
import { promises as fs } from 'fs';
import path from 'path';

export interface ZipPackagerOptions {
  files: Array<{
    path: string;
    name: string; // Name in the ZIP
  }>;
  outputPath: string;
}

export async function createZipPackage(options: ZipPackagerOptions): Promise<string> {
  const { files, outputPath } = options;

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, { recursive: true });

  return new Promise((resolve, reject) => {
    const output = createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    });

    output.on('close', () => {
      resolve(outputPath);
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    // Add files to archive
    for (const file of files) {
      archive.file(file.path, { name: file.name });
    }

    archive.finalize();
  });
}
