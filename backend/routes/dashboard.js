const express = require('express');
const pool = require('../db');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/summary', asyncHandler(async (req, res) => {
  const [[counts]] = await pool.query(
    `
      SELECT
        (SELECT COUNT(*) FROM beneficiario) AS totalBeneficiarios,
        (SELECT COUNT(*) FROM colaborador) AS totalColaboradores,
        (SELECT COUNT(*) FROM entrega_ayuda) AS totalEntregas,
        (SELECT COUNT(*) FROM municipio) AS totalCiudades
    `
  );

  const [topCities] = await pool.query(
    `
      SELECT
        m.nombre_municipio AS nombre_ciudad,
        m.codigo_dane_municipio,
        d.nombre_departamento AS nombre_region,
        d.codigo_dane_departamento,
        COUNT(*) AS total_entregas
      FROM entrega_ayuda e
      INNER JOIN municipio m ON m.id_municipio = e.id_municipio_entrega
      INNER JOIN departamento d ON d.id_departamento = m.id_departamento
      GROUP BY m.id_municipio, m.nombre_municipio, m.codigo_dane_municipio, d.nombre_departamento, d.codigo_dane_departamento
      ORDER BY total_entregas DESC, m.nombre_municipio ASC
      LIMIT 5
    `
  );

  res.json({ ...counts, topCities });
}));

module.exports = router;
