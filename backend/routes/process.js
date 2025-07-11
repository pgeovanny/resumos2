import axios from 'axios';
import Joi from 'joi';
import { logger } from '../logger.js';

const schema = Joi.object({
  texto_base: Joi.string().min(10).required(),
  questoes_texto: Joi.string().allow('', null),
  banca: Joi.string().required(),
  modo: Joi.string().valid('Resumir', 'Esquematizar').required()
});

export default async function processRoute(req, res) {
  logger.info('Process called');
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const { texto_base, questoes_texto, banca, modo } = value;
  let prompt = `Você é especialista em legislação. Use estilo ${banca}.`;
  prompt += `\nBase: ${texto_base}`;
  if (questoes_texto) prompt += `\nQuestões: ${questoes_texto}`;
  if (modo === 'Esquematizar') prompt += `\nEsquematize com quadros, tabelas, <mark class="negative">exceções</mark> e <mark class="special">prazos</mark>.`;

  try {
    const resp = await axios.post(process.env.GEMINI_ENDPOINT, {
      prompt, max_output_tokens: 2000, temperature: 0.7
    }, {
      headers: { 'Authorization': `Bearer ${process.env.GEMINI_API_KEY}` }
    });
    const processed = resp.data.candidates?.[0]?.output || '';
    res.json({ processed_text: processed });
  } catch (err) {
    logger.error(err);
    res.status(502).json({ message: 'AI service error' });
  }
}
