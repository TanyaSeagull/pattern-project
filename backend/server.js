import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Pattern } from './Pattern.js';

dotenv.config(); // Достаем пароли из скрытого файла .env

const app = express();
const PORT = 5000;

// Разрешаем запросы с других адресов
app.use(cors());

// 1. Подключаемся к облаку
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Успешно подключились к MongoDB Atlas!'))
  .catch((err) => console.error('❌ Ошибка подключения к базе:', err));

// 2. API-маршрут
app.get('/api/patterns', async (req, res) => {
  try {
    // Отдать все лекала, что есть в базе
    const patterns = await Pattern.find(); 
    res.json(patterns); // Отправляем их React-у
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера при поиске лекал" });
  }
});

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`🚀 Сервер самурая работает на http://localhost:${PORT}`);
});