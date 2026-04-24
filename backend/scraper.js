import axios from 'axios';
import * as cheerio from 'cheerio';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Pattern } from './Pattern.js';

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

// Твоя умная функция категорий (мы её уже делали)
function getCategory(title) {
  const t = title.toLowerCase();
  if (t.includes('платье') || t.includes('dress') || t.includes('сарафан')) return 'dresses';
  if (t.includes('брюки') || t.includes('pants') || t.includes('trousers') || t.includes('шорты')) return 'pants';
  if (t.includes('футболка') || t.includes('top') || t.includes('shirt') || t.includes('топ')) return 'blouses';
  if (t.includes('пальто') || t.includes('coat') || t.includes('jacket') || t.includes('жакет')) return 'outerwear';
  return 'other';
}

// --- GRASSER ---
async function scrapeGrasser() {
  const url = 'https://grasser.ru/vykrojki/besplatnye-vykrojki/';
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const patterns = [];

  $('.catalog-block').each((i, el) => {
    const title = $(el).find('.catalog-block__title').text().trim();
    const link = 'https://grasser.ru' + $(el).find('.catalog-block__title').attr('href');
    const image = 'https://grasser.ru' + $(el).find('.catalog-block__image img').first().attr('src');

    patterns.push({ title, link, image, gender: 'women', category: getCategory(title), sizes: [42, 44, 46] });
  });
  return patterns;
}

// --- BURDA RU ---
async function scrapeBurdaRU() {
  const url = 'https://burdastyle.ru/vikroyki/';
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const patterns = [];

  $('.item').each((i, el) => {
    const title = $(el).find('.item-title').text().trim();
    const link = 'https://burdastyle.ru' + $(el).find('.item-title a').attr('href');
    // У картинок на Бурде часто есть lazy-loading, поэтому проверяем data-src
    const image = $(el).find('.item-image img').attr('data-src') || $(el).find('.item-image img').attr('src');

    if (title && link) {
      patterns.push({ title, link, image, gender: 'women', category: getCategory(title), sizes: [36, 38, 40, 42] });
    }
  });
  return patterns;
}

// --- BURDA COM (EN) ---
async function scrapeBurdaCOM() {
  const url = 'https://www.burdastyle.com/sewing-patterns/women';
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const patterns = [];

  $('.product-item').each((i, el) => {
    const title = $(el).find('.product-item-link').text().trim();
    const link = $(el).find('.product-item-link').attr('href');
    const image = $(el).find('.product-image-photo').attr('src');

    if (title && link) {
      patterns.push({ 
        title, 
        link, 
        image, 
        gender: 'women', 
        category: getCategory(title), 
        sizes: [34, 36, 38, 40] 
      });
    }
  });
  return patterns;
}

// --- ГЛАВНЫЙ ЗАПУСК ---
async function run() {
  try {
    console.log("🛠 Запуск парсера...");
    
    const grasserPatterns = await scrapeGrasser();
    console.log(`✅ Grasser: ${grasserPatterns.length}`);

    const burdaRUPatterns = await scrapeBurdaRU();
    console.log(`✅ Burda RU: ${burdaRUPatterns.length}`);

    const burdaCOMPatterns = await scrapeBurdaCOM();
    console.log(`✅ Burda COM: ${burdaCOMPatterns.length}`);

    const all = [...grasserPatterns, ...burdaRUPatterns, ...burdaCOMPatterns];

    await Pattern.deleteMany({});
    await Pattern.insertMany(all);

    console.log(`Всего в базе: ${all.length} лекал.`);
    process.exit();
  } catch (error) {
    console.error("❌ Ошибка:", error.message);
    process.exit(1);
  }
}

run();