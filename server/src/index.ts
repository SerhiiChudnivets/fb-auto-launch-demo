import express from 'express';
import cors from 'cors';
import fieldsRouter from './routes/fields.js';
import templatesRouter from './routes/templates.js';
import groupsRouter from './routes/groups.js';
import launchRouter from './routes/launch.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.use('/api/fields', fieldsRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/template-groups', groupsRouter);
app.use('/api/launch-groups', launchRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
