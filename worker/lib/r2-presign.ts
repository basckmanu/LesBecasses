// Module Infra 1 — relu par le dev.
// Génère une URL présignée PUT sur l'endpoint S3 de R2.
// ⚠ Les URLs présignées ne marchent QUE sur <account>.r2.cloudflarestorage.com,
// pas sur media. : on uploade via S3, on lit via media.
// Prérequis : CORS du bucket (origine du site, méthode PUT, header Content-Type).
import { AwsClient } from 'aws4fetch';

export type PresignOptions = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  key: string;
  contentType: string;
  expiresIn?: number; // secondes
};

export async function presignPut(opts: PresignOptions): Promise<string> {
  const client = new AwsClient({
    accessKeyId: opts.accessKeyId,
    secretAccessKey: opts.secretAccessKey,
    service: 's3',
    region: 'auto',
  });
  const url = new URL(
    `https://${opts.accountId}.r2.cloudflarestorage.com/${opts.bucket}/${encodeURIComponent(opts.key)}`,
  );
  url.searchParams.set('X-Amz-Expires', String(opts.expiresIn ?? 900));

  const signed = await client.sign(
    new Request(url, { method: 'PUT', headers: { 'Content-Type': opts.contentType } }),
    { aws: { signQuery: true } },
  );
  return signed.url;
}
