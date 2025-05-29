const express = require('express');
const cors = require('cors');

// Inicializar la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de GESTOR funcionando correctamente' });
});

// Ejemplo de ruta para autenticación
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Aquí implementarías la lógica real de autenticación
  if (username === 'admin' && password === 'admin') {
    res.json({
      success: true,
      user: {
        id: 1,
        name: 'Administrador',
        email: 'admin@gestor.com',
        role: 'admin'
      },
      token: 'jwt-token-simulado'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Credenciales inválidas'
    });
  }
});

// Ejemplo de ruta para obtener datos
app.get('/api/data', (req, res) => {
  res.json({
    items: [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' }
    ]
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor API ejecutándose en el puerto ${PORT}`);
});