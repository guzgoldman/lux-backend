const express                     = require('express');
const cors                        = require('cors');
const morgan                      = require('morgan');
const cookieParser                = require('cookie-parser');
const authRoutes                  = require('../modules/auth/authRoutes');
const userRoutes                  = require('../modules/user/userRoutes');
const preinscripcionRoutes        = require('../modules/preinscripcion/preinscripcionRoutes');
const gestionPreinscripcionRoutes = require('../modules/admin/gestionPreinscripcion/preinscripcionRoutes');
const errorHandler                = require('../middlewares/errorHandler');

const app = express();

app.use(cookieParser());
app.use(cors({
  origin      : 'http://192.168.0.213:5173',
  credentials : true
}));
app.use(express.json());
app.use(morgan('dev'));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuario', userRoutes);
app.use('/api/preinscripcion', preinscripcionRoutes);
app.use('/api/admin/preinscripcion', gestionPreinscripcionRoutes);

// Middleware de manejo de errores
app.use(errorHandler);

module.exports = app;
