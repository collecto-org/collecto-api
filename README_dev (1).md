
# Guía rápida de desarrollo - Collecto

## Requisitos

- Tener Docker Desktop instalado y corriendo
- Tener Node.js 18+ instalado

## Pasos para comenzar

1. Clona el repositorio y entra en el directorio del proyecto:

```bash
git clone https://github.com/tu-usuario/collecto-api.git
cd collecto-api
```

2. Instala las dependencias:

```bash
npm install
```

3. Crea un archivo `.env.local` en la raíz con este contenido:

```env
RABBITMQ_URL=amqp://localhost
```

4. Asegúrate de que Docker esté encendido y funcionando. En Windows y macOS, abre Docker Desktop antes de continuar.

5. Levanta el entorno con:

```bash
npm run dev
```

Este comando arranca:
- RabbitMQ y el email-worker en Docker
- El backend en local con `nodemon`

No necesitas ejecutar contenedores manualmente.

## Listo

El backend estará disponible en `http://localhost:3000` y el panel de RabbitMQ en `http://localhost:15672`.

