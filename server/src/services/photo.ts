import sharp from 'sharp';

/**
 * Compress a photo by resizing to a maximum width and adjusting JPEG quality.
 * Also generates a thumbnail version.
 */
export async function compressPhoto(
  inputPath: string,
  outputPath: string,
  thumbnailPath?: string
): Promise<void> {
  // Create the main compressed image
  await sharp(inputPath)
    .rotate() // Auto-rotate based on EXIF orientation
    .resize({
      width: 1920,
      height: 1920,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 80, progressive: true })
    .toFile(outputPath);

  // Generate thumbnail if path provided
  if (thumbnailPath) {
    await sharp(inputPath)
      .rotate()
      .resize({
        width: 300,
        height: 300,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 70, progressive: true })
      .toFile(thumbnailPath);
  }
}
