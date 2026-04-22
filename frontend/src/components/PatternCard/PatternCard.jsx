import React from 'react';
import './PatternCard.css'; 

function PatternCard({ pattern }) {
  const getCategoryName = (category) => {
    const categories = {
      pants: 'Брюки',
      skirts: 'Юбки',
      dresses: 'Платья',
      't-shirts': 'Футболки' // Добавил категорию из твоих новых данных
    };
    return categories[category] || category;
  };

  return (
    <div className="pattern-card">
      <img 
        src={pattern.image} 
        alt={pattern.title} 
        className="pattern-card-image" 
      />
      
      <div className="pattern-card-info">
        <div>
          <h3 className="pattern-card-title">{pattern.title}</h3>
          
          <div className="pattern-card-meta">
            {/* ИСПРАВЛЕНО: выводим диапазон размеров через тире или запятую */}
            <span>Размеры: <strong>{pattern.sizes.join(', ')}</strong></span>
            {' | '}
            <span className="pattern-category-tag">
              {getCategoryName(pattern.category)}
            </span>
          </div>
        </div>

        <a 
          href={pattern.link} 
          target="_blank"             
          rel="noopener noreferrer"   
          className="pattern-card-button"
        >
          Скачать у автора
        </a>
      </div>
    </div>
  );
}

export default PatternCard;