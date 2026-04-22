import mongoose from 'mongoose';

const patternSchema = new mongoose.Schema({
  title: String,
  gender: String,
  category: String,
  sizes: [Number], // Массив чисел
  link: String,
  image: String
});

export const Pattern = mongoose.model('Pattern', patternSchema);