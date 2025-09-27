const ImageBlob = require('../models/ImageBlob');
const { encrypt, decrypt } = require('./crypto');

// nanoid v5 is ESM-only; use dynamic import in CommonJS and lazy-init the generator
let idGenerator;
async function ensureIdGenerator() {
  if (!idGenerator) {
    const { customAlphabet } = await import('nanoid');
    idGenerator = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12);
  }
}

async function saveImage(buffer, contentType) {
  await ensureIdGenerator();
  const payload = encrypt(buffer);
  const id = idGenerator();
  await ImageBlob.findByIdAndUpdate(
    id,
    { _id: id, contentType, blob: payload },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return id;
}

async function getImageBase64(id) {
  if (!id) return null;
  const rec = await ImageBlob.findById(id).lean();
  if (!rec) return null;
  const plaintext = decrypt(rec.blob);
  return {
    contentType: rec.contentType,
    data: plaintext.toString('base64')
  };
}

async function deleteImage(id) {
  if (!id) return;
  await ImageBlob.findByIdAndDelete(id);
}

module.exports = { saveImage, getImageBase64, deleteImage };
