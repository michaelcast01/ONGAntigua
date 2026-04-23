const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/login', (req, res) => {
  const { usuario, contrasena, contraseña } = req.body || {};
  const password = contrasena || contraseña;
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (!usuario || !password) {
    return res.status(400).json({ error: 'Usuario y contrasena requeridos' });
  }

  if (usuario !== adminUser || password !== adminPassword) {
    return res.status(401).json({ error: 'Credenciales invalidas' });
  }

  const token = jwt.sign(
    {
      username: adminUser,
      role: 'Administrador'
    },
    process.env.JWT_SECRET || 'ayudas_sociales_dev_secret',
    { expiresIn: '8h' }
  );

  return res.json({
    token,
    usuario: {
      nombre: adminUser,
      rol: 'Administrador'
    }
  });
});

module.exports = router;
