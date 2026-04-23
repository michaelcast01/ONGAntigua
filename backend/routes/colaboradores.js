const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

function handleDbError(res, error) {
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'La cedula ya existe' });
  }

  if (error.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({ error: 'No se puede eliminar porque tiene entregas asociadas' });
  }

  return res.status(500).json({ error: 'Error interno del servidor' });
}

router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `
      SELECT c.id_colaborador, c.nombre_colaborador, c.cedula, c.telefono, c.correo, c.id_cargo, ca.nombre_cargo
      FROM colaborador c
      LEFT JOIN cargo ca ON ca.id_cargo = c.id_cargo
      ORDER BY c.nombre_colaborador
    `
  );

  res.json(rows);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `
      SELECT c.id_colaborador, c.nombre_colaborador, c.cedula, c.telefono, c.correo, c.id_cargo, ca.nombre_cargo
      FROM colaborador c
      LEFT JOIN cargo ca ON ca.id_cargo = c.id_cargo
      WHERE c.id_colaborador = ?
    `,
    [Number(req.params.id)]
  );

  if (!rows.length) {
    return res.status(404).json({ error: 'Colaborador no encontrado' });
  }

  return res.json(rows[0]);
}));

router.post('/', requireAuth, async (req, res) => {
  const { nombre_colaborador, cedula, telefono, correo, id_cargo } = req.body || {};

  if (!nombre_colaborador || !cedula || !id_cargo) {
    return res.status(400).json({ error: 'nombre_colaborador, cedula e id_cargo son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      `
        INSERT INTO colaborador (nombre_colaborador, cedula, telefono, correo, id_cargo)
        VALUES (?, ?, ?, ?, ?)
      `,
      [nombre_colaborador, cedula, telefono || null, correo || null, Number(id_cargo)]
    );

    return res.status(201).json({ id_colaborador: result.insertId });
  } catch (error) {
    return handleDbError(res, error);
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const { nombre_colaborador, cedula, telefono, correo, id_cargo } = req.body || {};

  if (!nombre_colaborador || !cedula || !id_cargo) {
    return res.status(400).json({ error: 'nombre_colaborador, cedula e id_cargo son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      `
        UPDATE colaborador
        SET nombre_colaborador = ?, cedula = ?, telefono = ?, correo = ?, id_cargo = ?
        WHERE id_colaborador = ?
      `,
      [nombre_colaborador, cedula, telefono || null, correo || null, Number(id_cargo), Number(req.params.id)]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Colaborador no encontrado' });
    }

    return res.json({ ok: true });
  } catch (error) {
    return handleDbError(res, error);
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM colaborador WHERE id_colaborador = ?', [Number(req.params.id)]);

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Colaborador no encontrado' });
    }

    return res.status(204).send();
  } catch (error) {
    return handleDbError(res, error);
  }
});

module.exports = router;
