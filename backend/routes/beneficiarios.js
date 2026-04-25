const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

function parsePagination(query) {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 10)));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function handleDbError(res, error) {
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'El documento ya existe' });
  }

  if (error.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({ error: 'No se puede eliminar porque tiene entregas asociadas' });
  }

  return res.status(500).json({ error: 'Error interno del servidor' });
}

router.get('/', asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const filters = [];
  const params = [];

  if (req.query.q) {
    filters.push('(LOWER(b.nombres) LIKE LOWER(?) OR LOWER(b.documento) LIKE LOWER(?) OR LOWER(b.correo) LIKE LOWER(?))');
    params.push(`%${req.query.q}%`, `%${req.query.q}%`, `%${req.query.q}%`);
  }

  if (req.query.cityId) {
    filters.push('b.id_municipio = ?');
    params.push(Number(req.query.cityId));
  }

  if (req.query.populationTypeId) {
    filters.push('b.id_tipo_poblacion = ?');
    params.push(Number(req.query.populationTypeId));
  }

  if (req.query.helpTypeId) {
    filters.push(`EXISTS (
      SELECT 1
      FROM entrega_ayuda e
      WHERE e.id_beneficiario = b.id_beneficiario
        AND e.id_tipo_ayuda = ?
    )`);
    params.push(Number(req.query.helpTypeId));
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  const [[totalRow]] = await pool.query(
    `SELECT COUNT(*) AS total FROM beneficiario b ${whereClause}`,
    params
  );

  const [rows] = await pool.query(
    `
      SELECT
        b.id_beneficiario,
        b.nombres,
        b.documento,
        b.telefono,
        b.correo,
        b.direccion,
        b.id_municipio AS id_ciudad,
        m.codigo_dane_municipio,
        m.nombre_municipio AS nombre_ciudad,
        d.id_departamento AS id_region,
        d.codigo_dane_departamento,
        d.nombre_departamento AS nombre_region,
        b.id_tipo_poblacion,
        tp.nombre_tipo,
        (
          SELECT STRING_AGG(DISTINCT ta.nombre_ayuda, ', ' ORDER BY ta.nombre_ayuda)
          FROM entrega_ayuda e
          INNER JOIN tipo_ayuda ta ON ta.id_tipo_ayuda = e.id_tipo_ayuda
          WHERE e.id_beneficiario = b.id_beneficiario
        ) AS tipos_ayuda
      FROM beneficiario b
      LEFT JOIN municipio m ON m.id_municipio = b.id_municipio
      LEFT JOIN departamento d ON d.id_departamento = m.id_departamento
      LEFT JOIN tipo_poblacion tp ON tp.id_tipo_poblacion = b.id_tipo_poblacion
      ${whereClause}
      ORDER BY b.id_beneficiario DESC
      LIMIT ? OFFSET ?
    `,
    [...params, limit, offset]
  );

  res.json({
    data: rows,
    pagination: {
      page,
      limit,
      total: totalRow.total
    }
  });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `
      SELECT
        b.id_beneficiario,
        b.nombres,
        b.documento,
        b.telefono,
        b.correo,
        b.direccion,
        b.id_municipio AS id_ciudad,
        m.codigo_dane_municipio,
        m.nombre_municipio AS nombre_ciudad,
        d.id_departamento AS id_region,
        d.codigo_dane_departamento,
        d.nombre_departamento AS nombre_region,
        b.id_tipo_poblacion,
        tp.nombre_tipo
      FROM beneficiario b
      LEFT JOIN municipio m ON m.id_municipio = b.id_municipio
      LEFT JOIN departamento d ON d.id_departamento = m.id_departamento
      LEFT JOIN tipo_poblacion tp ON tp.id_tipo_poblacion = b.id_tipo_poblacion
      WHERE b.id_beneficiario = ?
    `,
    [Number(req.params.id)]
  );

  if (!rows.length) {
    return res.status(404).json({ error: 'Beneficiario no encontrado' });
  }

  return res.json(rows[0]);
}));

router.post('/', requireAuth, async (req, res) => {
  const { nombres, documento, telefono, correo, direccion, id_ciudad, id_tipo_poblacion } = req.body || {};

  if (!nombres || !documento || !id_ciudad || !id_tipo_poblacion) {
    return res.status(400).json({ error: 'nombres, documento, id_ciudad e id_tipo_poblacion son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      `
        INSERT INTO beneficiario (nombres, documento, telefono, correo, direccion, id_municipio, id_tipo_poblacion)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [nombres, documento, telefono || null, correo || null, direccion || null, Number(id_ciudad), Number(id_tipo_poblacion)]
    );

    return res.status(201).json({ id_beneficiario: result.insertId });
  } catch (error) {
    return handleDbError(res, error);
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const { nombres, documento, telefono, correo, direccion, id_ciudad, id_tipo_poblacion } = req.body || {};

  if (!nombres || !documento || !id_ciudad || !id_tipo_poblacion) {
    return res.status(400).json({ error: 'nombres, documento, id_ciudad e id_tipo_poblacion son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      `
        UPDATE beneficiario
        SET nombres = ?, documento = ?, telefono = ?, correo = ?, direccion = ?, id_municipio = ?, id_tipo_poblacion = ?
        WHERE id_beneficiario = ?
      `,
      [
        nombres,
        documento,
        telefono || null,
        correo || null,
        direccion || null,
        Number(id_ciudad),
        Number(id_tipo_poblacion),
        Number(req.params.id)
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Beneficiario no encontrado' });
    }

    return res.json({ ok: true });
  } catch (error) {
    return handleDbError(res, error);
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM beneficiario WHERE id_beneficiario = ?', [Number(req.params.id)]);

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Beneficiario no encontrado' });
    }

    return res.status(204).send();
  } catch (error) {
    return handleDbError(res, error);
  }
});

module.exports = router;
