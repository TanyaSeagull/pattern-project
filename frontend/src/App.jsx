import { useState, useEffect } from 'react';
import PatternCard from './components/PatternCard/PatternCard';
import axios from 'axios';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  // Сначала тут пустой массив []
  const [patterns, setPatterns] = useState([]);
  // Состояния для трех фильтров
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');

  useEffect(() => {
  const fetchPatterns = async () => {
    try {
      // Используем переменную API_URL
      const response = await axios.get(`${API_URL}/api/patterns`);
      setPatterns(response.data);
    } catch (error) {
      console.error("Ошибка при загрузке:", error);
    }
  };
  fetchPatterns();
}, []); // Пустые скобки [] - "сделай это один раз при открытии сайта"

  // Умная фильтрация
    const filteredPatterns = patterns.filter((pattern) => {
    const genderMatch = selectedGender === 'all' || pattern.gender === selectedGender;
    const categoryMatch = selectedCategory === 'all' || pattern.category === selectedCategory;
    
    // есть ли выбранный размер внутри этого массива
    const sizeMatch = selectedSize === 'all' || 
                      pattern.sizes.map(String).includes(selectedSize);

    return genderMatch && categoryMatch && sizeMatch;
  });

  // список всех уникальных размеров из всех лекал для выпадающего списка
  const allSizes = [...new Set(patterns.flatMap(p => p.sizes))].sort((a, b) => a - b);

  return (
    <div className="app-container">
      <h1>NeedleNet</h1>

      <div className="filters-container">
        {/* Фильтр по полу */}
        <select value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)}>
          <option value="all">All</option>
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="kids">Kids</option>
        </select>

        {/* Фильтр по категории */}
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="all">All</option>
          <option value="dresses">Dresses</option>
          <option value="pants">Pants</option>
          <option value="blouses">Blouses</option>
          <option value="outerwear">Outerwear</option> 
          <option value="other">Other</option> 
        </select>

        {/* Динамический фильтр по размеру */}
        <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
          <option value="all">Size (all)</option>
          {allSizes.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>

      <div className="patterns-grid">
        {filteredPatterns.length > 0 ? (
          filteredPatterns.map((pattern) => (
            <PatternCard key={pattern._id || pattern.id} pattern={pattern} />
          ))
        ) : (
          <div className="no-results">
            <p>Didn't find anything. Sorry !</p>
          </div>
        )}
      </div>
      <footer className="footer">
      <p>
        © 2026 NeedleNet | Created by{" "}
        <a href="https://tanyaseagull.github.io/Portfolio/" target="_blank" rel="noopener noreferrer">
          Tanya Seagull
        </a>
      </p>
    </footer>
    </div>
  );
}

export default App;