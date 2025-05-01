
# Entorno de Desarrollo - Collecto (RabbitMQ + Docker + Backend Local)

Este documento explica cómo levantar el entorno de desarrollo para el proyecto Collecto, que ahora incluye envío de correos mediante RabbitMQ y contenedores Docker.

## Requisitos previos

Antes de comenzar, asegúrate de tener instalado:

- Node.js 18 o superior
- Docker Desktop en funcionamiento
- Acceso a los archivos `.env` y `.env.local` (proporcionados por el equipo)

## Instalación del proyecto

Clona el repositorio e instala las dependencias del backend:

```bash
git clone https://github.com/tu-usuario/collecto-api.git
cd collecto-api
npm install
```

## Archivos de entorno

### `.env`

Archivo utilizado por Docker y producción. Debe contener las variables como `MONGO_URI`, `JWT_SECRET`, `EMAIL_USER`, etc.

En particular, debe tener:

```env
Revisar doppler .env y .env.local
```

### `.env.local`

Archivo específico para desarrollo local. Crea este archivo en la raíz del proyecto con el siguiente contenido:

```env
RABBITMQ_URL=amqp://localhost
```

Este valor permite que tu backend local se conecte al contenedor de RabbitMQ.

## Levantar el entorno

Ejecuta el siguiente comando:

```bash
npm run dev
```

Este comando hace lo siguiente:

1. Levanta los servicios `rabbitmq` y `email-worker` en Docker.
2. Inicia el backend en local con `nodemon`.
3. Usa `.env.local` para conectar con RabbitMQ.

## Acceso al panel de RabbitMQ

Puedes acceder al panel web de RabbitMQ para monitorear la cola de correos en:

http://localhost:15672

Credenciales por defecto:

- Usuario: `guest`
- Contraseña: `guest`

## Pruebas básicas

Puedes probar el registro de usuario y el envío de correos con herramientas como Postman:

1. Realiza un POST a `http://localhost:3000/api/auth/register` con los datos requeridos.
2. Revisa la bandeja de entrada del email especificado.
3. Verifica en los logs del contenedor que el correo se haya procesado correctamente.

## Detener los servicios

Para parar los contenedores de Docker:

```bash
npm run docker:down
```

## Consideraciones

- Asegúrate de que Docker esté corriendo antes de ejecutar `npm run dev`.
- Si cambias variables de entorno, reinicia el entorno con `docker compose down` y luego `npm run dev`.
