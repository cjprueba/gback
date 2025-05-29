FROM node:18-alpine

WORKDIR /app

# Copiamos los archivos de dependencias
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto 3000 que es el que usamos en la aplicación
EXPOSE 3000

# Iniciamos la aplicación
CMD ["node", "index.js"]