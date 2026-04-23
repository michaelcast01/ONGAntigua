CREATE DATABASE IF NOT EXISTS ayudas_sociales
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE ayudas_sociales;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS seed_sequence;
DROP TABLE IF EXISTS entrega_ayuda;
DROP TABLE IF EXISTS colaborador;
DROP TABLE IF EXISTS beneficiario;
DROP TABLE IF EXISTS municipio;
DROP TABLE IF EXISTS cargo;
DROP TABLE IF EXISTS tipo_ayuda;
DROP TABLE IF EXISTS tipo_poblacion;
DROP TABLE IF EXISTS departamento;
DROP TABLE IF EXISTS apellidos_base;
DROP TABLE IF EXISTS nombres_base;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE nombres_base (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE apellidos_base (
  id INT NOT NULL AUTO_INCREMENT,
  apellido VARCHAR(100) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE departamento (
  id_departamento INT NOT NULL AUTO_INCREMENT,
  codigo_dane_departamento CHAR(2) NOT NULL,
  nombre_departamento VARCHAR(100) NOT NULL,
  PRIMARY KEY (id_departamento),
  UNIQUE KEY uk_departamento_codigo_dane (codigo_dane_departamento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE municipio (
  id_municipio INT NOT NULL AUTO_INCREMENT,
  codigo_dane_municipio CHAR(5) NOT NULL,
  nombre_municipio VARCHAR(100) NOT NULL,
  id_departamento INT NOT NULL,
  PRIMARY KEY (id_municipio),
  UNIQUE KEY uk_municipio_codigo_dane (codigo_dane_municipio),
  KEY idx_municipio_departamento (id_departamento),
  CONSTRAINT fk_municipio_departamento FOREIGN KEY (id_departamento) REFERENCES departamento (id_departamento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE tipo_poblacion (
  id_tipo_poblacion INT NOT NULL AUTO_INCREMENT,
  nombre_tipo VARCHAR(150) DEFAULT NULL,
  PRIMARY KEY (id_tipo_poblacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE beneficiario (
  id_beneficiario INT NOT NULL AUTO_INCREMENT,
  nombres VARCHAR(100) DEFAULT NULL,
  documento VARCHAR(20) DEFAULT NULL,
  telefono VARCHAR(20) DEFAULT NULL,
  correo VARCHAR(100) DEFAULT NULL,
  direccion VARCHAR(150) DEFAULT NULL,
  id_municipio INT DEFAULT NULL,
  id_tipo_poblacion INT DEFAULT NULL,
  PRIMARY KEY (id_beneficiario),
  UNIQUE KEY uk_beneficiario_documento (documento),
  KEY idx_beneficiario_municipio (id_municipio),
  KEY idx_beneficiario_tipo_poblacion (id_tipo_poblacion),
  CONSTRAINT fk_beneficiario_municipio FOREIGN KEY (id_municipio) REFERENCES municipio (id_municipio),
  CONSTRAINT fk_beneficiario_tipo_poblacion FOREIGN KEY (id_tipo_poblacion) REFERENCES tipo_poblacion (id_tipo_poblacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE cargo (
  id_cargo INT NOT NULL AUTO_INCREMENT,
  nombre_cargo VARCHAR(50) DEFAULT NULL,
  descripcion VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (id_cargo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE colaborador (
  id_colaborador INT NOT NULL AUTO_INCREMENT,
  nombre_colaborador VARCHAR(100) DEFAULT NULL,
  cedula VARCHAR(20) DEFAULT NULL,
  telefono VARCHAR(20) DEFAULT NULL,
  correo VARCHAR(100) DEFAULT NULL,
  id_cargo INT DEFAULT NULL,
  PRIMARY KEY (id_colaborador),
  UNIQUE KEY uk_colaborador_cedula (cedula),
  KEY idx_colaborador_cargo (id_cargo),
  CONSTRAINT fk_colaborador_cargo FOREIGN KEY (id_cargo) REFERENCES cargo (id_cargo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE tipo_ayuda (
  id_tipo_ayuda INT NOT NULL AUTO_INCREMENT,
  nombre_ayuda VARCHAR(100) DEFAULT NULL,
  descripcion VARCHAR(150) DEFAULT NULL,
  PRIMARY KEY (id_tipo_ayuda)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE entrega_ayuda (
  id_entrega INT NOT NULL AUTO_INCREMENT,
  fecha_entrega DATE DEFAULT NULL,
  id_beneficiario INT DEFAULT NULL,
  id_municipio_entrega INT DEFAULT NULL,
  id_colaborador INT DEFAULT NULL,
  id_tipo_ayuda INT DEFAULT NULL,
  cantidad INT DEFAULT NULL,
  observaciones TEXT DEFAULT NULL,
  PRIMARY KEY (id_entrega),
  KEY idx_entrega_beneficiario (id_beneficiario),
  KEY idx_entrega_municipio (id_municipio_entrega),
  KEY idx_entrega_colaborador (id_colaborador),
  KEY idx_entrega_tipo_ayuda (id_tipo_ayuda),
  CONSTRAINT fk_entrega_beneficiario FOREIGN KEY (id_beneficiario) REFERENCES beneficiario (id_beneficiario),
  CONSTRAINT fk_entrega_municipio FOREIGN KEY (id_municipio_entrega) REFERENCES municipio (id_municipio),
  CONSTRAINT fk_entrega_colaborador FOREIGN KEY (id_colaborador) REFERENCES colaborador (id_colaborador),
  CONSTRAINT fk_entrega_tipo_ayuda FOREIGN KEY (id_tipo_ayuda) REFERENCES tipo_ayuda (id_tipo_ayuda)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE seed_sequence (
  n INT NOT NULL,
  PRIMARY KEY (n)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO nombres_base (id, nombre) VALUES
  (1, 'Maria'),
  (2, 'Santiago'),
  (3, 'Paula'),
  (4, 'Sofia'),
  (5, 'Andrea'),
  (6, 'Luis'),
  (7, 'Camila'),
  (8, 'Jorge'),
  (9, 'Pedro'),
  (10, 'Daniela'),
  (11, 'Laura'),
  (12, 'David'),
  (13, 'Carlos'),
  (14, 'Juan'),
  (15, 'Valentina'),
  (16, 'Miguel'),
  (17, 'Andres');

INSERT INTO apellidos_base (id, apellido) VALUES
  (1, 'Flores'),
  (2, 'Garcia'),
  (3, 'Sanchez'),
  (4, 'Torres'),
  (5, 'Rivera'),
  (6, 'Castro'),
  (7, 'Lopez'),
  (8, 'Moreno'),
  (9, 'Rodriguez'),
  (10, 'Gomez'),
  (11, 'Ramirez'),
  (12, 'Perez'),
  (13, 'Martinez'),
  (14, 'Rojas'),
  (15, 'Diaz'),
  (16, 'Gonzalez');

INSERT INTO departamento (id_departamento, codigo_dane_departamento, nombre_departamento) VALUES
  (1, '25', 'Cundinamarca'),
  (2, '05', 'Antioquia'),
  (3, '76', 'Valle del Cauca'),
  (4, '08', 'Atlantico'),
  (5, '68', 'Santander'),
  (6, '13', 'Bolivar');

INSERT INTO municipio (id_municipio, codigo_dane_municipio, nombre_municipio, id_departamento) VALUES
  (1, '11001', 'Bogota, D.C.', 1),
  (2, '25754', 'Soacha', 1),
  (3, '25175', 'Chia', 1),
  (4, '05001', 'Medellin', 2),
  (5, '05266', 'Envigado', 2),
  (6, '76001', 'Cali', 3),
  (7, '76520', 'Palmira', 3),
  (8, '08001', 'Barranquilla', 4),
  (9, '68001', 'Bucaramanga', 5),
  (10, '13001', 'Cartagena', 6);

INSERT INTO tipo_poblacion (id_tipo_poblacion, nombre_tipo) VALUES
  (1, 'Indigena'),
  (2, 'Gitano (Room)'),
  (3, 'Raizal'),
  (4, 'Palenquero (A)'),
  (5, 'Negro(a), mulato(a), afrodescendiente, afrocolombiano(a)'),
  (6, 'Ningun grupo etnico');

INSERT INTO cargo (id_cargo, nombre_cargo, descripcion) VALUES
  (1, 'Administrador', 'Control total del sistema'),
  (2, 'Gestor', 'Gestion de procesos'),
  (3, 'Validador', 'Verificacion de informacion');

INSERT INTO colaborador (id_colaborador, nombre_colaborador, cedula, telefono, correo, id_cargo) VALUES
  (1, 'Carlos Admin', '1001', '3001111111', 'admin@mail.com', 1),
  (2, 'Luisa Gestor', '1002', '3002222222', 'gestor@mail.com', 2),
  (3, 'Pedro Validador', '1003', '3003333333', 'validador@mail.com', 3);

INSERT INTO tipo_ayuda (id_tipo_ayuda, nombre_ayuda, descripcion) VALUES
  (1, 'Monetaria', 'Entrega de dinero'),
  (2, 'Ayuda fisica', 'Entrega de bienes');

INSERT INTO seed_sequence (n)
SELECT units.n + tens.n * 10 + hundreds.n * 100 + thousands.n * 1000 + 1
FROM
  (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS units
  CROSS JOIN (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS tens
  CROSS JOIN (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS hundreds
  CROSS JOIN (SELECT 0 AS n UNION ALL SELECT 1) AS thousands
WHERE units.n + tens.n * 10 + hundreds.n * 100 + thousands.n * 1000 < 1202;

INSERT INTO beneficiario (
  id_beneficiario,
  nombres,
  documento,
  telefono,
  correo,
  direccion,
  id_municipio,
  id_tipo_poblacion
)
SELECT
  s.n,
  CONCAT(nb.nombre, ' ', ab1.apellido, ' ', ab2.apellido) AS nombres,
  CAST(1000000000 + s.n AS CHAR),
  CONCAT('3', LPAD(s.n, 9, '0')),
  CONCAT('user', s.n, '@gmail.com'),
  CONCAT('Calle ', (s.n % 100) + 1, ' #', (s.n * 7) % 100, '-', (s.n * 3) % 50),
  ((s.n - 1) % 10) + 1,
  ((s.n - 1) % 6) + 1
FROM seed_sequence s
JOIN nombres_base nb ON nb.id = ((s.n - 1) % 17) + 1
JOIN apellidos_base ab1 ON ab1.id = ((s.n - 1) % 16) + 1
JOIN apellidos_base ab2 ON ab2.id = ((s.n + 5) % 16) + 1
WHERE s.n <= 1200;

INSERT INTO entrega_ayuda (
  id_entrega,
  fecha_entrega,
  id_beneficiario,
  id_municipio_entrega,
  id_colaborador,
  id_tipo_ayuda,
  cantidad,
  observaciones
)
SELECT
  s.n,
  DATE_ADD('2023-01-01', INTERVAL ((s.n * 3) % 700) DAY),
  ((s.n - 1) % 1200) + 1,
  ((s.n + 2) % 10) + 1,
  ((s.n - 1) % 3) + 1,
  ((s.n - 1) % 2) + 1,
  ((s.n - 1) % 10) + 1,
  CASE s.n % 5
    WHEN 0 THEN 'Entrega completa'
    WHEN 1 THEN 'Entrega parcial'
    WHEN 2 THEN 'Entrega prioritaria'
    WHEN 3 THEN 'Reprogramada'
    ELSE 'Beneficiario no encontrado'
  END
FROM seed_sequence s
WHERE s.n <= 1202;

DROP TABLE IF EXISTS seed_sequence;
