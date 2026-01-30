import { generatePDF } from '../services/pdfGenerator';
import { generateDOCX } from '../services/docxGenerator';
import { createZipPackage } from '../services/zipPackager';
import { storagePut } from '../storage';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

export interface AssemblerInput {
  applicationId: string;
  resumeMarkdown: string;
  coverLetter: string;
  linkedInMessage: string;
  userFullName: string;
  companyName: string;
  roleTitle: string;
}

export interface AssemblerOutput {
  packageUrl: string; // ZIP file URL
  files: {
    resumePDF: string;
    resumeDOCX: string;
    resumeTXT: string;
    coverLetterTXT: string;
    linkedInMessageTXT: string;
  };
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

export async function assembleApplicationPackage(
  input: AssemblerInput
): Promise<AssemblerOutput> {
  const { applicationId, resumeMarkdown, coverLetter, linkedInMessage, userFullName, companyName, roleTitle } = input;

  // Create temp directory for files
  const tempDir = path.join(os.tmpdir(), `app-${applicationId}-${Date.now()}`);
  await fs.mkdir(tempDir, { recursive: true });

  try {
    // Generate filenames
    const sanitizedCompany = sanitizeFilename(companyName);
    const sanitizedRole = sanitizeFilename(roleTitle);
    const sanitizedName = sanitizeFilename(userFullName);

    const resumePDFPath = path.join(tempDir, `${sanitizedName}_Resume_${sanitizedCompany}_${sanitizedRole}.pdf`);
    const resumeDOCXPath = path.join(tempDir, `${sanitizedName}_Resume_${sanitizedCompany}_${sanitizedRole}.docx`);
    const resumeTXTPath = path.join(tempDir, `${sanitizedName}_Resume_${sanitizedCompany}_${sanitizedRole}.txt`);
    const coverLetterPath = path.join(tempDir, `${sanitizedName}_CoverLetter_${sanitizedCompany}_${sanitizedRole}.txt`);
    const linkedInMessagePath = path.join(tempDir, `${sanitizedName}_LinkedIn_Message_${sanitizedCompany}_${sanitizedRole}.txt`);
    const zipPath = path.join(tempDir, `${sanitizedName}_Application_Package_${sanitizedCompany}_${sanitizedRole}.zip`);

    // Generate files
    await Promise.all([
      generatePDF({ markdown: resumeMarkdown, outputPath: resumePDFPath }),
      generateDOCX({ markdown: resumeMarkdown, outputPath: resumeDOCXPath }),
      fs.writeFile(resumeTXTPath, resumeMarkdown, 'utf-8'),
      fs.writeFile(coverLetterPath, coverLetter, 'utf-8'),
      fs.writeFile(linkedInMessagePath, linkedInMessage, 'utf-8'),
    ]);

    // Create ZIP package
    await createZipPackage({
      files: [
        { path: resumePDFPath, name: path.basename(resumePDFPath) },
        { path: resumeDOCXPath, name: path.basename(resumeDOCXPath) },
        { path: resumeTXTPath, name: path.basename(resumeTXTPath) },
        { path: coverLetterPath, name: path.basename(coverLetterPath) },
        { path: linkedInMessagePath, name: path.basename(linkedInMessagePath) },
      ],
      outputPath: zipPath,
    });

    // Upload all files to S3
    const [
      resumePDFUpload,
      resumeDOCXUpload,
      resumeTXTUpload,
      coverLetterUpload,
      linkedInMessageUpload,
      zipUpload,
    ] = await Promise.all([
      storagePut(`applications/${applicationId}/resume.pdf`, await fs.readFile(resumePDFPath), 'application/pdf'),
      storagePut(`applications/${applicationId}/resume.docx`, await fs.readFile(resumeDOCXPath), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
      storagePut(`applications/${applicationId}/resume.txt`, await fs.readFile(resumeTXTPath), 'text/plain'),
      storagePut(`applications/${applicationId}/cover_letter.txt`, await fs.readFile(coverLetterPath), 'text/plain'),
      storagePut(`applications/${applicationId}/linkedin_message.txt`, await fs.readFile(linkedInMessagePath), 'text/plain'),
      storagePut(`applications/${applicationId}/package.zip`, await fs.readFile(zipPath), 'application/zip'),
    ]);

    return {
      packageUrl: zipUpload.url,
      files: {
        resumePDF: resumePDFUpload.url,
        resumeDOCX: resumeDOCXUpload.url,
        resumeTXT: resumeTXTUpload.url,
        coverLetterTXT: coverLetterUpload.url,
        linkedInMessageTXT: linkedInMessageUpload.url,
      },
    };
  } finally {
    // Clean up temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
      console.error('Failed to clean up temp directory:', error);
    }
  }
}
