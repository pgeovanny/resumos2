import puppeteer from 'puppeteer';
import Joi from 'joi';
import { logger } from '../logger.js';
import { load } from 'cheerio';

const schema = Joi.object({ processed_text: Joi.string().required() });

export default async function exportRoute(req, res) {
  logger.info('Export PDF called');
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const { processed_text } = value;

  const $ = load(processed_text);
  let toc = '<h2>Sumário</h2><ul>';
  $('h1,h2').each((i,el) => { toc += `<li>${$(el).text()}</li>`; });
  toc += '</ul>';

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
    @page { margin:60px 40px 80px 40px; }
    body { font-family:Arial,sans-serif; line-height:1.6; }
    h2 { page-break-after:avoid; }
    .negative { background-color:#f8d7da; }
    .special { background-color:#cfe2ff; }
    table { width:100%; border-collapse:collapse; margin:20px 0; }
    th,td { border:1px solid #333; padding:8px; }
  </style></head><body>
    <header><h1>Gabarite – Versão Legislação</h1></header>
    ${toc}${$.html()}
  </body></html>`;

  const browser = await puppeteer.launch({ args:['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil:'networkidle0' });
  const pdfBuffer = await page.pdf({ format:'A4', printBackground:true });
  await browser.close();

  res.set({ 'Content-Type':'application/pdf', 'Content-Disposition':'attachment; filename="resumo.pdf"' });
  res.send(pdfBuffer);
}

export async function exportDocxRoute(req, res) {
  logger.info('Export DOCX called');
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  // Placeholder for DOCX export
  res.status(501).json({ message: 'DOCX export not implemented yet' });
}
