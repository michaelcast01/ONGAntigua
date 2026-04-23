const express = require('express');
const pool = require('../db');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/regiones', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `
      SELECT
        d.id_departamento AS id_region,
        d.codigo_dane_departamento,
        d.nombre_departamento AS nombre_region
      FROM departamento d
      ORDER BY d.nombre_departamento
    `
  );
  res.json(rows);
}));

router.get('/ciudades', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `
      SELECT
        m.id_municipio AS id_ciudad,
        m.codigo_dane_municipio,
        m.nombre_municipio AS nombre_ciudad,
        d.id_departamento AS id_region,
        d.codigo_dane_departamento,
        d.nombre_departamento AS nombre_region
      FROM municipio m
      INNER JOIN departamento d ON d.id_departamento = m.id_departamento
      ORDER BY m.nombre_municipio
    `
  );
  res.json(rows);
}));

router.get('/tipos-poblacion', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT id_tipo_poblacion, nombre_tipo FROM tipo_poblacion ORDER BY nombre_tipo');
  res.json(rows);
}));

router.get('/tipos-ayuda', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT id_tipo_ayuda, nombre_ayuda, descripcion FROM tipo_ayuda ORDER BY nombre_ayuda');
  res.json(rows);
}));

router.get('/cargos', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT id_cargo, nombre_cargo, descripcion FROM cargo ORDER BY nombre_cargo');
  res.json(rows);
}));

module.exports = router;
