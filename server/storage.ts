// S3-compatible storage (AWS S3, Cloudflare R2, Backblaze B2)
// Uses S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY; optional S3_REGION, S3_ENDPOINT

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ENV } from "./_core/env";

const SIGNED_URL_EXPIRY_SECONDS = 3600; // 1 hour

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  const { bucket, accessKeyId, secretAccessKey, region, endpoint } =
    ENV.s3Config;
  if (!bucket || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Storage not configured: set S3_BUCKET, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY (optional: S3_REGION, S3_ENDPOINT for R2/B2)"
    );
  }
  if (!s3Client) {
    s3Client = new S3Client({
      region: region || "us-east-1",
      ...(endpoint && { endpoint }),
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      ...(endpoint && {
        forcePathStyle: true,
      }),
    });
  }
  return s3Client;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const config = ENV.s3Config;
  if (!config.bucket || !config.accessKeyId || !config.secretAccessKey) {
    throw new Error(
      "Storage not configured: set S3_BUCKET, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY"
    );
  }
  const key = normalizeKey(relKey);
  const client = getS3Client();
  const body = typeof data === "string" ? Buffer.from(data, "utf8") : data;
  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  const signedUrl = await getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: config.bucket, Key: key }),
    { expiresIn: SIGNED_URL_EXPIRY_SECONDS }
  );
  return { key, url: signedUrl };
}

export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const config = ENV.s3Config;
  if (!config.bucket || !config.accessKeyId || !config.secretAccessKey) {
    throw new Error(
      "Storage not configured: set S3_BUCKET, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY"
    );
  }
  const key = normalizeKey(relKey);
  const client = getS3Client();
  const signedUrl = await getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: config.bucket, Key: key }),
    { expiresIn: SIGNED_URL_EXPIRY_SECONDS }
  );
  return { key, url: signedUrl };
}
