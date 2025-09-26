const express = require('express');
const Breeding = require('../../models/Breeding');
const { requireAuth, requireRoles } = require('../../middleware/auth');
const upload = require('../../middleware/upload');
const { saveImage, getImageBase64, deleteImage } = require('../../utils/imageStore');

const router = express.Router();

router.use(requireAuth, requireRoles('admin'));

router.post('/', upload.single('image'), async (req, res) => {
  try {
    let imageRef;
    if (req.file) {
      imageRef = await saveImage(req.file.buffer, req.file.mimetype);
    } else if (req.body && req.body.imageData && req.body.imageContentType) {
      const buf = Buffer.from(req.body.imageData, 'base64');
      imageRef = await saveImage(buf, req.body.imageContentType);
    }
    const payload = { ...req.body };
    if (imageRef) payload.imageRef = imageRef;
    // do not persist legacy inline image field anymore
    delete payload.image;
    const item = await Breeding.create(payload);
    const img = await getImageBase64(item.imageRef);
    const response = item.toJSON();
    if (img) response.image = img; // keep response compatibility
    res.status(201).json(response);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const items = await Breeding.find();
  const withImages = await Promise.all(
    items.map(async (it) => {
      const json = it.toJSON();
      const img = await getImageBase64(it.imageRef);
      if (img) json.image = img;
      return json;
    })
  );
  res.json(withImages);
});

router.put('/:id', upload.single('image'), async (req, res) => {
  let newImageRef;
  if (req.file) {
    newImageRef = await saveImage(req.file.buffer, req.file.mimetype);
  } else if (req.body && req.body.imageData && req.body.imageContentType) {
    const buf = Buffer.from(req.body.imageData, 'base64');
    newImageRef = await saveImage(buf, req.body.imageContentType);
  }
  const update = { ...req.body };
  delete update.image; // avoid legacy inline image
  if (newImageRef) update.imageRef = newImageRef;
  const prev = await Breeding.findById(req.params.id);
  const item = await Breeding.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!item) return res.status(404).json({ error: 'Not found' });
  // cleanup old image if replaced
  if (newImageRef && prev && prev.imageRef && prev.imageRef !== newImageRef) {
    await deleteImage(prev.imageRef);
  }
  const json = item.toJSON();
  const img = await getImageBase64(item.imageRef);
  if (img) json.image = img;
  res.json(json);
});

router.delete('/:id', async (req, res) => {
  const item = await Breeding.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  if (item.imageRef) {
    await deleteImage(item.imageRef);
  }
  res.json({ success: true });
});

module.exports = router;
