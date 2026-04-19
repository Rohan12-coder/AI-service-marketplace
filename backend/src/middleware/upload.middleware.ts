import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { sendError } from '../utils/helpers';

// ── Allowed MIME types ────────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// ── Multer memory storage (files go to RAM, then Cloudinary) ──────────────────
const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: JPEG, PNG, WebP, GIF`));
  }
};

// ── Base multer instance ──────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files:    10,
  },
});

// ── Upload single file ────────────────────────────────────────────────────────
export const uploadSingle = (fieldName: string) => upload.single(fieldName);

// ── Upload multiple files ─────────────────────────────────────────────────────
export const uploadMultiple = (fieldName: string, maxCount = 5) =>
  upload.array(fieldName, maxCount);

// ── Upload to Cloudinary helper ───────────────────────────────────────────────
interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  folder: string,
  options: Record<string, unknown> = {}
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder:         `smart-marketplace/${folder}`,
        resource_type:  'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        ...options,
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Cloudinary upload failed'));
          return;
        }
        resolve({
          url:      result.secure_url,
          publicId: result.public_id,
          width:    result.width,
          height:   result.height,
          format:   result.format,
          bytes:    result.bytes,
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// ── Delete from Cloudinary ────────────────────────────────────────────────────
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Failed to delete Cloudinary asset: ${publicId}`, error);
  }
};

// ── Middleware: process single uploaded avatar ─────────────────────────────────
export const processAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.file) return next();

  try {
    const result = await uploadToCloudinary(req.file.buffer, 'avatars', {
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });

    req.body.avatar = result.url;
    next();
  } catch (error) {
    const err = error as Error;
    sendError(res, `Avatar upload failed: ${err.message}`, 400);
  }
};

// ── Middleware: process multiple service/portfolio images ──────────────────────
export const processImages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) return next();

  try {
    const uploadPromises = files.map((file) =>
      uploadToCloudinary(file.buffer, 'services', {
        transformation: [
          { width: 1200, height: 800, crop: 'fill' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      })
    );

    const results = await Promise.all(uploadPromises);
    req.body.images = results.map((r) => r.url);
    next();
  } catch (error) {
    const err = error as Error;
    sendError(res, `Image upload failed: ${err.message}`, 400);
  }
};

// ── Multer error handler ──────────────────────────────────────────────────────
export const handleUploadError = (
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      sendError(res, `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`, 400);
      return;
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      sendError(res, 'Too many files uploaded.', 400);
      return;
    }
    sendError(res, `Upload error: ${err.message}`, 400);
    return;
  }

  if (err.message.includes('Unsupported file type')) {
    sendError(res, err.message, 400);
    return;
  }

  next(err);
};
