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

router.get('/', asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query);
  const filters = [];
  const params = [];

  if (req.query.q) {
    filters.push('(LOWER(b.nombres) LIKE LOWER(?) OR LOWER(b.documento) LIKE LOWER(?) OR LOWER(b.correo) LIKE LOWER(?))');
    params.push(`%${req.query.q}%`, `%${req.query.q}%`, `%${req.query.q}%`);
  }

  if (req.query.cityId) {
    filters.push('e.id_municipio_entrega = ?');
    params.push(Number(req.query.cityId));
  }

  if (req.query.populationTypeId) {
    filters.push('b.id_tipo_poblacion = ?');
    params.push(Number(req.query.populationTypeId));
  }

  if (req.query.helpTypeId) {
    filters.push('e.id_tipo_ayuda = ?');
    params.push(Number(req.query.helpTypeId));
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  const [[totalRow]] = await pool.query(
    `
      SELECT COUNT(*) AS total
      FROM entrega_ayuda e
      INNER JOIN beneficiario b ON b.id_beneficiario = e.id_beneficiario
      ${whereClause}
    `,
    params
  );

  const [rows] = await pool.query(
    `
      SELECT
        e.id_entrega,
        e.fecha_entrega,
        e.id_beneficiario,
        b.nombres AS beneficiario,
        e.id_municipio_entrega AS id_ciudad_entrega,
        m.codigo_dane_municipio,
        m.nombre_municipio AS nombre_ciudad,
        d.id_departamento AS id_region,
        d.codigo_dane_departamento,
        d.nombre_departamento AS nombre_region,
        e.id_colaborador,
        co.nombre_colaborador,
        e.id_tipo_ayuda,
        ta.nombre_ayuda,
        e.cantidad,
        e.observaciones
      FROM entrega_ayuda e
      INNER JOIN beneficiario b ON b.id_beneficiario = e.id_beneficiario
      INNER JOIN municipio m ON m.id_municipio = e.id_municipio_entrega
      INNER JOIN departamento d ON d.id_departamento = m.id_departamento
      INNER JOIN colaborador co ON co.id_colaborador = e.id_colaborador
      INNER JOIN tipo_ayuda ta ON ta.id_tipo_ayuda = e.id_tipo_ayuda
      ${whereClause}
      ORDER BY e.id_entrega DESC
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
        e.id_entrega,
        e.fecha_entrega,
        e.id_beneficiario,
        b.nombres AS beneficiario,
        e.id_municipio_entrega AS id_ciudad_entrega,
        m.codigo_dane_municipio,
        m.nombre_municipio AS nombre_ciudad,
        d.id_departamento AS id_region,
        d.codigo_dane_departamento,
        d.nombre_departamento AS nombre_region,
        e.id_colaborador,
        co.nombre_colaborador,
        e.id_tipo_ayuda,
        ta.nombre_ayuda,
        e.cantidad,
        e.observaciones
      FROM entrega_ayuda e
      INNER JOIN beneficiario b ON b.id_beneficiario = e.id_beneficiario
      INNER JOIN municipio m ON m.id_municipio = e.id_municipio_entrega
      INNER JOIN departamento d ON d.id_departamento = m.id_departamento
      INNER JOIN colaborador co ON co.id_colaborador = e.id_colaborador
      INNER JOIN tipo_ayuda ta ON ta.id_tipo_ayuda = e.id_tipo_ayuda
      WHERE e.id_entrega = ?
    `,
    [Number(req.params.id)]
  );

  if (!rows.length) {
    return res.status(404).json({ error: 'Entrega no encontrada' });
  }

  return res.json(rows[0]);
}));

router.post('/', requireAuth, async (req, res) => {
  const { fecha_entrega, id_beneficiario, id_ciudad_entrega, id_colaborador, id_tipo_ayuda, cantidad, observaciones } = req.body || {};

  if (!fecha_entrega || !id_beneficiario || !id_ciudad_entrega || !id_colaborador || !id_tipo_ayuda || !cantidad) {
    return res.status(400).json({ error: 'Todos los campos principales de la entrega son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      `
        INSERT INTO entrega_ayuda (fecha_entrega, id_beneficiario, id_municipio_entrega, id_colaborador, id_tipo_ayuda, cantidad, observaciones)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        fecha_entrega,
        Number(id_beneficiario),
        Number(id_ciudad_entrega),
        Number(id_colaborador),
        Number(id_tipo_ayuda),
        Number(cantidad),
        observaciones || null
      ]
    );

    return res.status(201).json({ id_entrega: result.insertId });
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo registrar la entrega' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  const { fecha_entrega, id_beneficiario, id_ciudad_entrega, id_colaborador, id_tipo_ayuda, cantidad, observaciones } = req.body || {};

  if (!fecha_entrega || !id_beneficiario || !id_ciudad_entrega || !id_colaborador || !id_tipo_ayuda || !cantidad) {
    return res.status(400).json({ error: 'Todos los campos principales de la entrega son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      `
        UPDATE entrega_ayuda
        SET fecha_entrega = ?, id_beneficiario = ?, id_municipio_entrega = ?, id_colaborador = ?, id_tipo_ayuda = ?, cantidad = ?, observaciones = ?
        WHERE id_entrega = ?
      `,
      [
        fecha_entrega,
        Number(id_beneficiario),
        Number(id_ciudad_entrega),
        Number(id_colaborador),
        Number(id_tipo_ayuda),
        Number(cantidad),
        observaciones || null,
        Number(req.params.id)
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Entrega no encontrada' });
    }

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo actualizar la entrega' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  const [result] = await pool.query('DELETE FROM entrega_ayuda WHERE id_entrega = ?', [Number(req.params.id)]);

  if (!result.affectedRows) {
    return res.status(404).json({ error: 'Entrega no encontrada' });
  }

  return res.status(204).send();
});

module.exports = router;
