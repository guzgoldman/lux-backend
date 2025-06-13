const express                   = require('express');
const cors                      = require('cors');
const morgan                    = require('morgan');
const authRoutes                = require('../modules/auth/authRoutes');
const userRoutes                = require('../modules/user/userRoutes');
const preinscripcionRoutes      = require('../modules/preinscripcion/preinscripcionRoutes');
const adminPreinscripcionRoutes = require('../modules/adminPreinscripcion/adminPreinscripcionRoutes');
const errorHandler              = require('../middlewares/errorHandler');
const cookieParser              = require('cookie-parser');

const app = express();

app.use(cookieParser());

app.use(cors({
  origin      : 'http://localhost:5173',  // URL del front
  credentials : true                      // ← ¡importante!
}));
app.use(express.json());
app.use(morgan('dev'));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/preinscripcion', preinscripcionRoutes);
app.use('/api/admin/preinscripcion', adminPreinscripcionRoutes);

// Middleware de manejo de errores
app.use(errorHandler);

module.exports = app;
