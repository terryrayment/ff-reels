import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectsCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const R2_CONFIGURED = Boolean(
  process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME,
);

if (!R2_CONFIGURED && process.env.VERCEL_ENV === "production") {
  throw new Error("R2 env vars are required in production.");
}

if (!R2_CONFIGURED && process.env.NODE_ENV !== "production") {
  console.warn("R2 env vars not configured — file uploads are disabled locally.");
}

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

export const R2_BUCKET = process.env.R2_BUCKET_NAME ?? "ff-reels";

/**
 * Generate a presigned URL for uploading a file directly to R2.
 */
export async function getUploadUrl(key: string, contentType: string, expiresIn = 3600) {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2, command, { expiresIn });
}

/**
 * Generate a presigned URL for downloading a file from R2.
 */
export async function getDownloadUrl(key: string, expiresIn = 3600, responseContentDisposition?: string) {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ...(responseContentDisposition && { ResponseContentDisposition: responseContentDisposition }),
  });
  return getSignedUrl(r2, command, { expiresIn });
}

function isMissingObjectError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { name?: string; $metadata?: { httpStatusCode?: number } };
  return (
    candidate.$metadata?.httpStatusCode === 404 ||
    candidate.name === "NotFound" ||
    candidate.name === "NoSuchKey"
  );
}

/**
 * Check whether an R2 object exists before handing out a signed URL.
 */
export async function objectExists(key: string) {
  if (!R2_CONFIGURED) return false;

  try {
    await r2.send(
      new HeadObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
      }),
    );
    return true;
  } catch (error) {
    if (isMissingObjectError(error)) return false;
    throw error;
  }
}

/**
 * Upload a buffer directly to R2 (server-side upload, no presigned URL).
 */
export async function uploadBuffer(key: string, buffer: Buffer, contentType: string) {
  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );
}

/**
 * Delete multiple objects from R2 by key.
 */
export async function deleteObjects(keys: string[]) {
  if (keys.length === 0) return;
  await r2.send(
    new DeleteObjectsCommand({
      Bucket: R2_BUCKET,
      Delete: { Objects: keys.map((Key) => ({ Key })) },
    }),
  );
}
