import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Portfolio.css'; // Create this CSS file to style Portfolio if needed

const Portfolio = () => {
  const [portfolios, setPortfolios] = useState([]);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/portfolio'); // Adjust API URL as per your backend
        setPortfolios(response.data);
      } catch (error) {
        console.error('Error fetching portfolios:', error);
      }
    };

    fetchPortfolios();
  }, []);

  return (
    <div className="portfolio">
      <h2>Portfolio</h2>
      <ul>
        {portfolios.map((item) => (
          <li key={item._id}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Portfolio;
