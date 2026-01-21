import { spawn } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

export async function markdownToPDF(markdownContent) {
  return new Promise((resolve, reject) => {
    const tempMd = join(tmpdir(), `resume-${Date.now()}.md`);
    const tempPdf = join(tmpdir(), `resume-${Date.now()}.pdf`);

    try {
      writeFileSync(tempMd, markdownContent);

      const process = spawn('manus-md-to-pdf', [tempMd, tempPdf]);
      
      let stderr = '';
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        try {
          unlinkSync(tempMd);
        } catch (e) {
          // Ignore cleanup errors
        }

        if (code !== 0) {
          reject(new Error(`PDF generation failed: ${stderr}`));
        } else {
          resolve(tempPdf);
        }
      });

      process.on('error', (err) => {
        try {
          unlinkSync(tempMd);
        } catch (e) {
          // Ignore cleanup errors
        }
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}
