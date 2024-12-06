const express = require('express');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

// Ruta para servir un formulario simple en HTML
app.get('/', (req, res) => {
  res.send(`
    <form action="/upload" enctype="multipart/form-data" method="post">
      <input type="text" name="username" placeholder="Nombre de usuario"><br>
      <input type="file" name="image"><br>
      <button type="submit">Subir imagen</button>
    </form>
  `);
});

// Ruta para manejar la subida de archivos
app.post('/upload', (req, res) => {
  const form = new formidable.IncomingForm();

  // Definir la carpeta donde se guardarán los archivos
  form.uploadDir = path.join(__dirname, '/uploads');
  form.keepExtensions = true; // Mantener la extensión original

  // Procesar la solicitud
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // `fields` contiene los datos del formulario (e.g., nombre de usuario)
    console.log('Campos del formulario:', fields);

    // `files` contiene la información del archivo cargado (e.g., imagen)
    console.log('Archivos subidos:', files.image[0].filepath);

    const oldPath =  files.image[0].filepath; // Ruta temporal del archivo
    

    const newFileName = `${Date.now()}-${files.image[0].originalFilename}`; // Nombre nuevo del archivo
    const newPath = path.join(form.uploadDir, newFileName); // Ruta de destino
    
    // Mover el archivo a la carpeta final
    fs.rename(oldPath, newPath, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al mover el archivo' });
      }
      res.status(200).send(`Archivo subido exitosamente: ${newFileName}`);
    });
  });
});

// Crear carpeta "uploads" si no existe
if (!fs.existsSync(path.join(__dirname, '/uploads'))) {
  fs.mkdirSync(path.join(__dirname, '/uploads'));
}

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
