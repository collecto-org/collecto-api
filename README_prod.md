
# Despliegue en Producción - Collecto (AWS + Docker Compose)

Este documento describe cómo desplegar el proyecto Collecto en un entorno de producción, como un servidor en AWS, utilizando Docker Compose.

## Requisitos del servidor

Asegúrate de que el servidor de producción tenga instalado:

- Docker
- Docker Compose
- Node.js (solo si se ejecuta código fuera de contenedores)
- Acceso SSH para desplegar y gestionar el entorno

## Estructura esperada del proyecto

El repositorio debe contener al menos:

- `Dockerfile`
- `docker-compose.yml`
- Directorio `src/` con el backend y el email-worker
- Archivos `.env` y variables de entorno seguras

## Variables de entorno (`.env`)

Estas deben estar adaptadas para producción, incluyendo:

```env
Revisar Doppler .env y .env.local
```

Coloca este archivo `.env` en el mismo directorio que tu `docker-compose.yml` en el servidor.

## Despliegue inicial

En el servidor:

```bash
git clone https://github.com/tu-usuario/collecto-api.git
cd collecto-api
docker compose up --build -d
```

Esto construirá y ejecutará los servicios necesarios:

- `backend`
- `email-worker`
- `rabbitmq`

## Acceso al panel de administración de RabbitMQ

RabbitMQ expone un panel de control accesible en:

```
http://<IP_DEL_SERVIDOR>:15672
Usuario: guest
Contraseña: guest
```

**Nota:** Para mayor seguridad, considera cambiar las credenciales en producción.

## Actualizar el entorno en producción

Cuando haya cambios en el código:

```bash
git pull origin main
docker compose down
docker compose up --build -d
```

## Logs y depuración

Puedes revisar los logs de cada servicio con:

```bash
docker compose logs -f backend
docker compose logs -f email-worker
docker compose logs -f rabbitmq
```

## Seguridad recomendada

- Usa HTTPS con un proxy inverso (Nginx + Certbot)
- Cambia las credenciales por defecto de RabbitMQ
- Usa variables de entorno diferentes a las de desarrollo
- Activa firewalls y acceso restringido por IP

## Backup y mantenimiento

Asegúrate de hacer backups periódicos de:

- La base de datos MongoDB (si es local)
- El volumen de datos de RabbitMQ (si usas persistencia)

