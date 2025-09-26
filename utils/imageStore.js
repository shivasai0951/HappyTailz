const { customAlphabet } = require('nanoid');
const ImageBlob = require('../models/ImageBlob');
const { encrypt, decrypt } = require('./crypto');

const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12);

async function saveImage(buffer, contentType) {
  const payload = encrypt(buffer);
  const id = nanoid();
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
