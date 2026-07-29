/**
 * Copies a Node Buffer into a fresh Uint8Array backed by a plain
 * ArrayBuffer. Needed because Next.js's Response/BlobPart types require an
 * ArrayBuffer (not the broader ArrayBufferLike/SharedArrayBuffer union that
 * Buffer.buffer is typed as), so a Buffer can't be passed to `new
 * NextResponse(...)` or `new Blob([...])` directly under strict TS.
 */
export function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  const arrayBuffer = new ArrayBuffer(buffer.byteLength);
  new Uint8Array(arrayBuffer).set(buffer);
  return arrayBuffer;
}
