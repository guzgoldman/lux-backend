# 🎓 LUX Backend - API del Sistema de Gestión Educativa

API RESTful del sistema de gestión educativa LUX, desarrollado para el Instituto Superior Nuestra Señora de Luján del Buen Viaje.

## ✨ Características

- 🔐 **Autenticación JWT** con roles diferenciados (admin, alumno, usuario)
- 👥 **Gestión de Usuarios y Alumnos** con control completo de permisos
- 📝 **Sistema de Preinscripciones** con validaciones y estados
- 📧 **Envío de Emails Automatizado** con sistema de colas (BullMQ)
- 📄 **Generación Dinámica de PDFs** usando Puppeteer
- 🔄 **Sistema de Colas** para procesos en background
- 📊 **Panel de Monitoreo** de colas con Bull Board (desarrollo)
- 🗄️ **Base de Datos MySQL** con Sequelize ORM
- ⚡ **Redis** para gestión de colas y caché

## 🛠️ Stack Tecnológico

- **Node.js** v22 - Runtime de JavaScript
- **Express** v5.1 - Framework web
- **MySQL** - Base de datos relacional
- **Sequelize** v6.37 - ORM
- **JWT** - Autenticación
- **BullMQ** - Sistema de colas
- **Redis** - Cache y colas
- **Puppeteer** - Generación de PDFs
- **Nodemailer** - Envío de emails
- **Bcrypt** - Hash de contraseñas
- **Handlebars** - Templates de email
- **Morgan** - Logger HTTP
- **Docker** - Contenedorización

## 📋 Requisitos Previos

- Node.js v22 o superior
- MySQL 5.7 o superior
- Redis 6.0 o superior
- npm o yarn

## 🚀 Instalación Local

### 1. Cloná el repositorio

```bash
git clone <url-repositorio-backend>
cd lux-backend
```

### 2. Instalá las dependencias

```bash
npm install
```

### 3. Configurá las variables de entorno

Creá un archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=lux_database
DB_PORT=3306

# JWT
JWT_SECRET=tu_secreto_super_seguro_cambiar_en_produccion
JWT_EXPIRES_IN=1h

# Configuración
NODE_ENV=development
PORT=3000

# Email (Gmail)
SMTP_SERVICE=gmail
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_contraseña_de_aplicacion
MAIL_FROM='"Instituto Superior Nuestra Señora de Luján" <tu_email@gmail.com>'

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# CORS (URL del frontend)
CORS_ORIGIN=http://localhost:5173
```

### 4. Configurá la base de datos

Creá la base de datos en MySQL:

```sql
CREATE DATABASE lux_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Ejecutá las migraciones:

```bash
npx sequelize-cli db:migrate
```

Si necesitás crear migraciones nuevas:

```bash
npx sequelize-cli migration:generate --name nombre-de-la-migracion
```

### 5. Iniciá Redis

**Con Docker:**
```bash
docker run -d --name redis -p 6379:6379 redis:alpine
```

**O instalalo en tu sistema:**
```bash
# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# macOS
brew install redis
brew services start redis
```

### 6. Iniciá el servidor

```bash
npm start
```

La API va a estar disponible en `http://localhost:3000`

### 7. Accedé al panel de colas (solo en desarrollo)

Entrá a `http://localhost:3000/admin/queues` para monitorear las colas de trabajos en tiempo real con Bull Board.

## 🐳 Docker

### Construir y ejecutar con Docker

```bash
# Construí la imagen
docker build -t lux-backend .

# Ejecutá el contenedor
docker run -d \
  --name lux-backend \
  -p 3000:3000 \
  --env-file .env \
  lux-backend
```

### Docker Compose (con servicios)

Creá un archivo `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    env_file:
      - .env
    depends_on:
      - mysql
      - redis
    volumes:
      - .:/app
      - /app/node_modules

  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: lux_database
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

volumes:
  mysql_data:
```

Ejecutá:

```bash
docker-compose up -d
```

## 📦 Despliegue en Producción

### Con PM2 (Recomendado)

```bash
# Instalá PM2 globalmente
npm install -g pm2

# Iniciá la aplicación
pm2 start server.js --name lux-backend

# Configurá para que inicie al arrancar el sistema
pm2 startup
pm2 save
```

**Comandos útiles:**

```bash
pm2 list                # Listá las aplicaciones
pm2 logs lux-backend    # Mirá los logs
pm2 restart lux-backend # Reiniciá
pm2 stop lux-backend    # Detené
pm2 monit              # Monitor en tiempo real
```

### Variables de entorno en producción

Asegurate de cambiar estos valores en producción:

```env
NODE_ENV=production
JWT_SECRET=un_secreto_muy_seguro_y_aleatorio
DB_PASSWORD=contraseña_segura
REDIS_PASSWORD=otra_contraseña_segura
CORS_ORIGIN=https://tu-dominio.com
```

## 📚 Estructura del Proyecto

```
lux-backend/
├── src/
│   ├── config/              # Configuración de Express, DB, etc.
│   │   └── app.js          # Configuración principal de Express
│   ├── middlewares/         # Middlewares personalizados
│   │   ├── auth.js         # Verificación de JWT
│   │   └── validators.js   # Validaciones
│   ├── models/              # Modelos de Sequelize
│   │   ├── index.js        # Configuración de Sequelize
│   │   ├── User.js
│   │   ├── Alumno.js
│   │   └── Preinscripcion.js
│   ├── modules/             # Módulos funcionales (rutas + controladores)
│   │   ├── auth/           # Autenticación
│   │   │   ├── auth.routes.js
│   │   │   └── auth.controller.js
│   │   ├── user/           # Gestión de usuarios
│   │   ├── alumno/         # Gestión de alumnos
│   │   ├── preinscripcion/ # Preinscripciones
│   │   └── admin/          # Panel administrativo
│   ├── services/            # Lógica de negocio
│   │   ├── email.service.js
│   │   └── pdf.service.js
│   ├── queues/              # Definición de colas BullMQ
│   │   └── email.queue.js
│   ├── workers/             # Procesadores de colas
│   │   └── email.worker.js
│   ├── templates/           # Templates de emails (Handlebars)
│   │   ├── welcome.hbs
│   │   └── preinscripcion.hbs
│   ├── pdf/                 # Templates y generación de PDFs
│   ├── utils/               # Utilidades generales
│   └── assets/              # Recursos estáticos
├── migrations/              # Migraciones de Sequelize
├── scripts/                 # Scripts de utilidad
├── config/                  # Configuración de Sequelize CLI
├── .env                     # Variables de entorno (NO SUBIR A GIT)
├── .env.example            # Ejemplo de variables de entorno
├── .gitignore
├── Dockerfile
├── server.js               # Punto de entrada
└── package.json
```

## 🔌 API Endpoints

### Autenticación

```
POST   /api/auth/login          # Login de usuario
POST   /api/auth/register       # Registro de usuario
POST   /api/auth/refresh        # Refrescar token
POST   /api/auth/logout         # Cerrar sesión
POST   /api/auth/forgot-password # Recuperar contraseña
```

### Usuarios

```
GET    /api/users              # Listar usuarios (admin)
GET    /api/users/:id          # Obtener usuario
PUT    /api/users/:id          # Actualizar usuario
DELETE /api/users/:id          # Eliminar usuario
```

### Alumnos

```
GET    /api/alumnos            # Listar alumnos
GET    /api/alumnos/:id        # Obtener alumno
POST   /api/alumnos            # Crear alumno
PUT    /api/alumnos/:id        # Actualizar alumno
DELETE /api/alumnos/:id        # Eliminar alumno
```

### Preinscripciones

```
GET    /api/preinscripciones           # Listar preinscripciones
GET    /api/preinscripciones/:id       # Obtener preinscripción
POST   /api/preinscripciones           # Crear preinscripción
PUT    /api/preinscripciones/:id       # Actualizar preinscripción
PUT    /api/preinscripciones/:id/estado # Cambiar estado
```

### Admin

```
GET    /api/admin/stats        # Estadísticas generales
GET    /api/admin/dashboard    # Datos del dashboard
```

## 🔒 Autenticación

La API usa JWT (JSON Web Tokens) para autenticación. Para acceder a rutas protegidas, incluí el token en el header:

```
Authorization: Bearer <tu-token-jwt>
```

**Ejemplo con Axios:**

```javascript
axios.get('http://localhost:3000/api/usuarios', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 🔧 Configuración Adicional

### Configurar Gmail para envío de emails

1. Habilitá la verificación en 2 pasos en tu cuenta de Gmail
2. Generá una contraseña de aplicación:
   - Configuración → Seguridad → Verificación en 2 pasos
   - Contraseñas de aplicaciones → Seleccioná "Correo" y "Otra"
   - Copiá la contraseña generada
3. Usá esa contraseña en `SMTP_PASS`

### Sequelize CLI

Comandos útiles:

```bash
# Crear una migración
npx sequelize-cli migration:generate --name crear-tabla-ejemplo

# Ejecutar migraciones pendientes
npx sequelize-cli db:migrate

# Revertir última migración
npx sequelize-cli db:migrate:undo

# Crear un seeder
npx sequelize-cli seed:generate --name usuarios-ejemplo

# Ejecutar seeders
npx sequelize-cli db:seed:all
```

## 🐛 Debugging

### Ver logs en desarrollo

Los logs van a aparecer en la consola cuando ejecutás `npm start`.

### Bull Board (Solo Desarrollo)

Accedé a `http://localhost:3000/admin/queues` para:
- Ver trabajos en la cola
- Ver trabajos completados
- Ver trabajos fallidos
- Reintentar trabajos
- Eliminar trabajos

### Logs con PM2

```bash
pm2 logs lux-backend        # Ver logs en tiempo real
pm2 logs lux-backend --lines 100  # Ver últimas 100 líneas
```

### Logs con Docker

```bash
docker logs lux-backend -f  # Seguir logs en tiempo real
docker logs lux-backend --tail 50  # Ver últimas 50 líneas
```

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén implementados)
npm test

# Tests con coverage
npm run test:coverage
```

## 📝 Scripts Disponibles

```bash
npm start              # Iniciar servidor
npm run dev            # Iniciar con nodemon (auto-reload)
npm test               # Ejecutar tests
```

## 🔐 Seguridad

- ✅ Contraseñas hasheadas con bcrypt (10 rounds)
- ✅ JWT con expiración configurable
- ✅ CORS configurado
- ✅ Rate limiting (implementar en producción)
- ✅ Validación de inputs
- ✅ Headers de seguridad con Helmet (implementar)
- ✅ Variables sensibles en .env

**Recomendaciones para producción:**

```bash
npm install helmet express-rate-limit
```

Agregá en `src/config/app.js`:

```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de requests
});

app.use('/api/', limiter);
```

## 🤝 Contribución

Leé [CONTRIBUTING.md](CONTRIBUTING.md) para conocer las guías de contribución.

## 📄 Licencia

[MIT License](LICENSE)

## 👥 Autores

Desarrollado para el Instituto Superior Nuestra Señora de Luján del Buen Viaje

---

**¿Problemas o preguntas?** Abrí un issue en el repositorio.
