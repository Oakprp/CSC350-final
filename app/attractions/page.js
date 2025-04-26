'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import './styles.css';

async function getData() {
  try {
    const res = await fetch('http://localhost:3000/api/attractions', {
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error('Failed to fetch data');
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

export default function FoodsPage() {
  const [foods, setFoods] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('ทั้งหมด');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const data = await getData();
      setFoods(data);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const categories = ['ทั้งหมด', ...new Set(foods.map(food => food.category))];

  const filteredFoods = categoryFilter === 'ทั้งหมด'
    ? foods
    : foods.filter(food => food.category === categoryFilter);

  return (
    <div className="container">
      <div className="header">
        <h1>รายการอาหารและสารอาหาร</h1>
        <Link href="/admin/login" className="admin-button">สำหรับผู้ดูแล</Link>
      </div>

      <div className="filter">
        <label htmlFor="category">เลือกหมวดหมู่:</label>
        <select
          id="category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="message">กำลังโหลด...</p>
      ) : filteredFoods.length === 0 ? (
        <p className="message">ไม่พบข้อมูลอาหาร</p>
      ) : (
        <div className="food-grid">
          {filteredFoods.map(food => (
            <div key={food.food_id} className="food-card">
              {food.image_url ? (
                <img
                  src={food.image_url}
                  alt={food.food_name}
                  className="food-image"
                  loading="lazy"
                />
              ) : (
                <div className="no-image">
                  <span>ไม่มีรูปภาพ</span>
                </div>
              )}
              <div className="food-details">
                <h2>{food.food_name}</h2>
                <p><strong>หมวดหมู่:</strong> {food.category}</p>
                <p><strong>ขนาดหน่วยบริโภค:</strong> {food.serving_size}</p>
                <div className="nutrients">
                  <h3>สารอาหาร:</h3>
                  <ul>
                    <li>โปรตีน: {food.protein} กรัม</li>
                    <li>ไขมัน: {food.fat} กรัม</li>
                    <li>คาร์โบไฮเดรต: {food.carbohydrates} กรัม</li>
                    <li>ไฟเบอร์: {food.fiber} กรัม</li>
                    <li>น้ำตาล: {food.sugar} กรัม</li>
                    <li>โซเดียม: {food.sodium} มก.</li>
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}//sawasdee