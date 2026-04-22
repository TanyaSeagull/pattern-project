import { useState, useEffect } from 'react';
import PatternCard from './components/PatternCard/PatternCard';
import './App.css';

function App() {
  // Данные хранятся в состоянии. Сначала тут пустой массив []
  const [patterns, setPatterns] = useState([]);
  // Состояния для трех фильтров
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');

  useEffect(() => {
    const fetchPatterns = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/patterns');
        const data = await response.json();
        setPatterns(data); // Кладем привезенные данные на "полку"
      } catch (error) {
        console.error("Ошибка курьера:", error);
      }
    };

    fetchPatterns();
  }, []); // Пустые скобки [] значат: "сделай это один раз при открытии сайта"

  // Умная фильтрация
    const filteredPatterns = patterns.filter((pattern) => {
    const genderMatch = selectedGender === 'all' || pattern.gender === selectedGender;
    const categoryMatch = selectedCategory === 'all' || pattern.category === selectedCategory;
    
    // Проверка размера: так как в данных теперь массив [42, 44], 
    // мы проверяем, есть ли выбранный размер внутри этого массива
    const sizeMatch = selectedSize === 'all' || 
                      pattern.sizes.map(String).includes(selectedSize);

    return genderMatch && categoryMatch && sizeMatch;
  });

  // Получаем список всех уникальных размеров из всех лекал для выпадающего списка
  const allSizes = [...new Set(patterns.flatMap(p => p.sizes))].sort((a, b) => a - b);

  return (
    <div className="app-container">
      <h1>Pattern Aggregator</h1>

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
          <option value="t-shirts">Shirts</option>
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
    </div>
  );
}

export default App;