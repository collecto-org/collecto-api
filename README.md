# Collecto - Backend

Este proyecto contiene el backend de **Collecto**. La API está desarrollada en Node.js con Express y MongoDB, y utiliza servicios adicionales como RabbitMQ y Cloudinary.

## Requisitos previos

- Node.js 18.x
- Docker y Docker Compose
- Acceso a internet para instalar dependencias y acceder a servicios externos

## Instalación

1. Clona este repositorio.
2. Crea un archivo `.env` en la raíz del proyecto siguiendo el modelo indicado más abajo.
3. Instala las dependencias ejecutando el siguiente comando en la raíz del proyecto:

   ```bash
   npm install
   ```

4. Levanta todos los servicios con Docker Compose:

   ```bash
   docker-compose up --build
   ```

   Este comando iniciará los siguientes servicios:
   - RabbitMQ (interfaz disponible en http://localhost:15672, usuario: `guest`, contraseña: `guest`)
   - Backend (http://localhost:3000)
   - Websockets (http://localhost:4000)
   - Email worker (conectado automáticamente a RabbitMQ)

## Variables de entorno

Ejemplo de archivo `.env`:

```
MONGO_URI=mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/collecto-evaluacion
PORT=3000
JWT_SECRET=<clave_secreta>
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
SOCKETS_PORT=4000
EMAIL_USER=collecto.kc@gmail.com
EMAIL_PASS=<clave_app_gmail>
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RABBITMQ_URL=amqp://rabbitmq
```

## Documentación de la API

La documentación de la API está disponible en Swagger:

- [SwaggerHub](https://app.swaggerhub.com/apis-docs/collecto-0bb/CollectoAPI/1.0.0)
- Localmente en: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Observaciones adicionales

- El archivo `swagger.yaml` debe estar en la raíz del proyecto para que la documentación local funcione correctamente.
- La URL de RabbitMQ dentro del entorno Docker debe ser `amqp://rabbitmq`.
- El servidor inicia dos procesos independientes: API REST en el puerto 3000 y sockets en el puerto 4000.

## Estructura del proyecto

- `src/server.js`: punto de entrada principal de la aplicación
- `src/routes/`: rutas organizadas por entidad
- `src/models/`: esquemas de Mongoose
- `src/services/`: lógica compartida como sockets, cronjobs, email, etc.
- `src/email-worker/`: servicio externo para el envío de correos a través de la cola RabbitMQ