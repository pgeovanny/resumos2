import fetch from 'node-fetch';
import { fileTypeFromBuffer } from 'file-type';
import extractText from '../utils/extractText.js';
import { logger } from '../logger.js';

export default async function extractRoute(req, res) {
  logger.info('Extract called', { hasFile: !!req.file, hasUrl: !!req.body.url });
  let buffer, mimetype;
  if (req.body.url) {
    const response = await fetch(req.body.url);
    buffer = Buffer.from(await response.arrayBuffer());
    const type = await fileTypeFromBuffer(buffer);
    mimetype = type?.mime || 'text/html';
  } else if (req.file) {
    buffer = req.file.buffer;
    mimetype = req.file.mimetype;
  } else {
    return res.status(400).json({ message: 'Provide file or url.' });
  }
  const text = await extractText(buffer, mimetype);
  res.json({ text });
}
