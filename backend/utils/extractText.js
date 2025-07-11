import mammoth from 'mammoth';

export default async function extractText(buffer, mimetype) {
  if (mimetype === 'application/pdf' || !mimetype) {
    const { default: pdfParse } = await import('pdf-parse/lib/pdf-parse.js');
    const data = await pdfParse(buffer);
    return data.text;
  }
  if (mimetype.includes('wordprocessingml')) {
    return (await mammoth.extractRawText({ buffer })).value;
  }
  return buffer.toString('utf8');
}
