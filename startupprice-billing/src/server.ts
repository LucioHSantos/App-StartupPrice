import express from 'express';
import { env } from './env';
import billingRouter from './routes/billing';

const app = express();

// Middleware para logging de requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Rotas de billing
app.use('/api/billing', billingRouter);

// Middleware de tratamento de erros
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Server] Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar servidor
const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Servidor de billing iniciado na porta ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`💳 Billing endpoints: http://localhost:${PORT}/api/billing`);
});



