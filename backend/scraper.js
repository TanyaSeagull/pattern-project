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

// --- УЛУЧШЕННЫЙ РЕЦЕПТ ДЛЯ BURDA RU ---
async function scrapeBurdaRU() {
  const url = 'https://burdastyle.ru/vikroyki/';
  try {
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' } // Маскируемся под браузер
    });
    const $ = cheerio.load(data);
    const patterns = [];

    // На Burda RU карточки часто имеют класс .m-vikroyka-list-item или .v-card
    $('.m-vikroyka-list-item, .v-card, .item').each((i, el) => {
      const title = $(el).find('.item-title, .v-card__title').text().trim();
      const linkAttr = $(el).find('a').first().attr('href');
      
      // Ищем картинку в разных атрибутах (из-за Lazy Load)
      const imgTag = $(el).find('img').first();
      let image = imgTag.attr('data-src') || imgTag.attr('data-srcset') || imgTag.attr('src');

      if (title && linkAttr) {
        // Чиним ссылку
        const link = linkAttr.startsWith('http') ? linkAttr : `https://burdastyle.ru${linkAttr}`;
        // Чиним картинку (убираем лишние параметры из srcset если есть)
        if (image) {
          image = image.split(' ')[0]; // Берем только первую ссылку из списка srcset
          if (!image.startsWith('http')) image = `https://burdastyle.ru${image}`;
        }

        patterns.push({
          title,
          link,
          image,
          gender: 'women',
          category: getCategory(title),
          sizes: [36, 38, 40, 42]
        });
      }
    });
    return patterns;
  } catch (e) {
    console.log("Ошибка Burda RU:", e.message);
    return [];
  }
}

// --- УЛУЧШЕННЫЙ РЕЦЕПТ ДЛЯ BURDA COM ---
async function scrapeBurdaCOM() {
  const url = 'https://www.burdastyle.com/sewing-patterns/women';
  try {
    const { data } = await axios.get(url, {
      headers: {
        // Делаем вид, что мы — настоящий современный браузер
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': 'https://www.google.com/' // Делаем вид, что пришли из поиска Google
      }
    });

    const $ = cheerio.load(data);
    const patterns = [];

    // На Burda.com товары часто лежат в .product-item-info или .product-item
    $('.product-item-info, .product-item').each((i, el) => {
      const title = $(el).find('.product-item-link').text().trim();
      const link = $(el).find('.product-item-link').attr('href');
      
      // Ищем картинку более тщательно
      const imgTag = $(el).find('.product-image-photo');
      let image = imgTag.attr('src') || imgTag.attr('data-src');

      if (title && link) {
        patterns.push({
          title: `[INT] ${title}`, // Добавим метку, что это международное лекало
          link: link,
          image: image,
          gender: 'women',
          category: getCategory(title),
          sizes: [34, 36, 38, 40]
        });
      }
    });

    if (patterns.length === 0) {
      console.log("⚠️ Burda.com всё еще не отдаёт данные. Возможно, там стоит защита от роботов.");
    }

    return patterns;
  } catch (e) {
    console.log("❌ Ошибка при доступе к Burda.com:", e.message);
    return [];
  }
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