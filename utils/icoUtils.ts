
/**
 * Creates an ICO file blob from a PNG file's ArrayBuffer.
 * This implementation embeds the PNG directly, which is supported by modern operating systems.
 * 
 * @param pngBuffer The ArrayBuffer containing the raw PNG file data.
 * @param width The width of the image.
 * @param height The height of the image.
 * @returns A Blob representing the .ico file.
 */
export const createIcoFromPng = (pngBuffer: ArrayBuffer, width: number, height: number): Blob => {
  // Total size is 6 bytes for header, 16 for directory entry, plus PNG size
  const icoBufferSize = 22 + pngBuffer.byteLength;
  const buffer = new ArrayBuffer(icoBufferSize);
  const view = new DataView(buffer);

  // --- ICO Header (6 bytes) ---
  // 2 bytes: Reserved, must be 0
  view.setUint16(0, 0, true); // Little-endian
  // 2 bytes: Image type, 1 for ICO
  view.setUint16(2, 1, true);
  // 2 bytes: Number of images
  view.setUint16(4, 1, true);

  // --- Icon Directory Entry (16 bytes) ---
  // 1 byte: Width (0 means 256)
  view.setUint8(6, width >= 256 ? 0 : width);
  // 1 byte: Height (0 means 256)
  view.setUint8(7, height >= 256 ? 0 : height);
  // 1 byte: Color palette count (0 for no palette)
  view.setUint8(8, 0);
  // 1 byte: Reserved, should be 0
  view.setUint8(9, 0);
  // 2 bytes: Color planes (1)
  view.setUint16(10, 1, true);
  // 2 bytes: Bits per pixel (e.g., 32)
  view.setUint16(12, 32, true);
  // 4 bytes: Size of the image data (PNG size)
  view.setUint32(14, pngBuffer.byteLength, true);
  // 4 bytes: Offset of image data from start of file
  view.setUint32(18, 22, true); // Header (6) + Dir Entry (16) = 22

  // --- Image Data ---
  // Copy the PNG data into the buffer at the specified offset
  const pngBytes = new Uint8Array(pngBuffer);
  const icoBytes = new Uint8Array(buffer);
  icoBytes.set(pngBytes, 22);

  return new Blob([buffer], { type: 'image/x-icon' });
};
