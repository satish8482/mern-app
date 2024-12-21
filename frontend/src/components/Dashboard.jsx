import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiUrl = "http://localhost:3000"; // Update with your API endpoint
        const response = await axios.get(`${apiUrl}/products`);
        setProducts(response.data.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="product-container">
      <h2>Product Dashboard</h2>
      <div className="products-grid">
        {products.map((product, index) => (
          <div className="product-card" key={index}>
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>Price: ${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
