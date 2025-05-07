# Usa una imagen oficial de Node.js
FROM node:18

# Crea y establece el directorio de trabajo
WORKDIR /usr/src/app

# Copia los archivos del proyecto y instala las dependencias
COPY package*.json ./
RUN npm install
COPY . .

# Expone el puerto que usará el backend
EXPOSE 3000

# Comando por defecto para arrancar el backend

# corrre en visual
# CMD ["npm", "run", "dev"]       
# CMD ["nodemon", "src/server.js"]


# corre en ubuntu
 CMD ["node", "src/server.js"]   


