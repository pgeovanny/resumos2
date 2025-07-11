import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'express-async-errors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { validateEnv } from './middleware/validateEnv.js';
import { logger } from './logger.js';

// Carrega variáveis de ambiente e valida
dotenv.config();
validateEnv();

// Define a porta **antes** de qualquer uso
const PORT = process.env.PORT || process.env.GAE_PORT || 8080;

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: logger.stream }));

// Rotas
app.get('/', (req, res) => res.send('Law Summarizer Backend OK'));
app.use('/api', routes);

// Tratamento de erros
app.use(errorHandler);

// Inicia o servidor
app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});


