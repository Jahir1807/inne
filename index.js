const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Conexión MySQL
const db = mysql.createConnection({
  host: 'database-1.cdcw20u0kxcr.us-east-2.rds.amazonaws.com',
  user: 'admin',
  password: '7876460000_Jose',     
  database: 'inejon'
});

db.connect(err => {
  if (err) throw err;
  console.log('Conectado a la base de datos MySQL');
});

// Endpoint: Obtener todas las personas
app.get('/personas', (req, res) => {
  const sql = `
    SELECT p.id AS persona_id, p.curp, n.nombre, ap.apellido_paterno,
           am.apellido_materno, fn.fecha_nacimiento, s.sexo,
           d.domicilio, m.municipio, e.estado
    FROM persona p
    JOIN nombre n ON p.nombre_id = n.id
    JOIN apellido_paterno ap ON p.apellido_paterno_id = ap.id
    JOIN apellido_materno am ON p.apellido_materno_id = am.id
    JOIN fecha_nacimiento fn ON p.fecha_nacimiento_id = fn.id
    JOIN sexo s ON p.sexo_id = s.id
    JOIN domicilio d ON p.domicilio_id = d.id
    JOIN municipio m ON p.municipio_id = m.id
    JOIN estado e ON p.estado_id = e.id;
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Endpoint: Obtener por ID
app.get('/personas/:id', (req, res) => {
  const id = req.params.id;
  const sql = `
    SELECT p.id AS persona_id, p.curp, n.nombre, ap.apellido_paterno,
           am.apellido_materno, fn.fecha_nacimiento, s.sexo,
           d.domicilio, m.municipio, e.estado
    FROM persona p
    JOIN nombre n ON p.nombre_id = n.id
    JOIN apellido_paterno ap ON p.apellido_paterno_id = ap.id
    JOIN apellido_materno am ON p.apellido_materno_id = am.id
    JOIN fecha_nacimiento fn ON p.fecha_nacimiento_id = fn.id
    JOIN sexo s ON p.sexo_id = s.id
    JOIN domicilio d ON p.domicilio_id = d.id
    JOIN municipio m ON p.municipio_id = m.id
    JOIN estado e ON p.estado_id = e.id
    WHERE p.id = ?;
  `;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results[0]);
  });
});

// Endpoint: Obtener por CURP
app.get('/personas/curp/:curp', (req, res) => {
  const curp = req.params.curp;
  const sql = `
    SELECT p.id AS persona_id, p.curp, n.nombre, ap.apellido_paterno,
           am.apellido_materno, fn.fecha_nacimiento, s.sexo,
           d.domicilio, m.municipio, e.estado
    FROM persona p
    JOIN nombre n ON p.nombre_id = n.id
    JOIN apellido_paterno ap ON p.apellido_paterno_id = ap.id
    JOIN apellido_materno am ON p.apellido_materno_id = am.id
    JOIN fecha_nacimiento fn ON p.fecha_nacimiento_id = fn.id
    JOIN sexo s ON p.sexo_id = s.id
    JOIN domicilio d ON p.domicilio_id = d.id
    JOIN municipio m ON p.municipio_id = m.id
    JOIN estado e ON p.estado_id = e.id
    WHERE p.curp = ?;
  `;
  db.query(sql, [curp], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results[0]);
  });
});

// Endpoint: Registrar una persona
app.post('/personas', (req, res) => {
  const {
    curp, nombre, apellido_paterno, apellido_materno,
    fecha_nacimiento, sexo, domicilio, municipio, estado
  } = req.body;

  const insertAndGetId = (table, field, value) => {
    return new Promise((resolve, reject) => {
      db.query(`INSERT INTO ${table} (${field}) VALUES (?)`, [value], (err, result) => {
        if (err) reject(err);
        else resolve(result.insertId);
      });
    });
  };

  (async () => {
    try {
      const nombreId = await insertAndGetId('nombre', 'nombre', nombre);
      const apId = await insertAndGetId('apellido_paterno', 'apellido_paterno', apellido_paterno);
      const amId = await insertAndGetId('apellido_materno', 'apellido_materno', apellido_materno);
      const fnId = await insertAndGetId('fecha_nacimiento', 'fecha_nacimiento', fecha_nacimiento);
      const sexoId = await insertAndGetId('sexo', 'sexo', sexo);
      const domId = await insertAndGetId('domicilio', 'domicilio', domicilio);
      const munId = await insertAndGetId('municipio', 'municipio', municipio);
      const estId = await insertAndGetId('estado', 'estado', estado);

      const sql = `
        INSERT INTO persona (
          curp, nombre_id, apellido_paterno_id, apellido_materno_id,
          fecha_nacimiento_id, sexo_id, domicilio_id, municipio_id, estado_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(sql, [curp, nombreId, apId, amId, fnId, sexoId, domId, munId, estId], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).json({ message: 'Persona registrada', id: result.insertId });
      });
    } catch (err) {
      res.status(500).send(err);
    }
  })();
});

// Endpoint: Eliminar persona por ID
app.delete('/personas/:id', (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM persona WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Persona eliminada' });
  });
});

// Iniciar servidor
app.listen(3000, () => {
  console.log('Microservicio corriendo en http://localhost:3000');
});
