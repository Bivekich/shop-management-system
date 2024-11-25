# Используем официальный образ Node.js
FROM node:18-alpine

# Устанавливаем рабочую директорию в контейнере
WORKDIR /app

# Копируем package.json, package-lock.json и .npmrc
COPY package*.json .npmrc ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код приложения
COPY . .

# Генерируем Prisma-клиент
RUN npx prisma generate

# Собираем приложение
RUN npm run build

# Открываем порт, который будет использовать приложение
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]

