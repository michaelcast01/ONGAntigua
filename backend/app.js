require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./db');
const authRoutes = require('./routes/auth');
const catalogosRoutes = require('./routes/catalogos');
const dashboardRoutes = require('./routes/dashboard');
const beneficiariosRoutes = require('./routes/beneficiarios');
const colaboradoresRoutes = require('./routes/colaboradores');
const entregasRoutes = require('./routes/entregas');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'error', error: 'No se pudo conectar a la base de datos' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/catalogos', catalogosRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/beneficiarios', beneficiariosRoutes);
app.use('/api/colaboradores', colaboradoresRoutes);
app.use('/api/entregas', entregasRoutes);

app.get('/', (req, res) => {
  res.json({
    nombre: 'Sistema de Ayudas Sociales API',
    version: '1.0.0'
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((error, req, res, next) => {
  console.error(error);

  if (error && error.code) {
    return res.status(500).json({ error: 'Error de base de datos' });
  }

  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
