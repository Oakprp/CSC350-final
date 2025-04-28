'use client'; 
import React, { useState, useEffect } from 'react'; 
import Link from 'next/link'; 
import './styles.css';

async function getData() {
  try {
    // ส่ง GET request ไปยัง API เพื่อดึงข้อมูลอาหาร
    const res = await fetch('/api/attractions', {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch data'); 
    }

    const data = await res.json();
    
    return data.map(food => ({
      ...food,
      protein: Number(food.protein) || 0,
      fat: Number(food.fat) || 0,
      carbohydrates: Number(food.carbohydrates) || 0,
      fiber: Number(food.fiber) || 0,
      sugar: Number(food.sugar) || 0,
      sodium: Number(food.sodium) || 0,
    }));
  } catch (error) {
    console.error('Error fetching data:', error); 
    return []; 
  }
}

// Component หลักของหน้า Attractions สำหรับแสดงรายการอาหารและคำนวณสารอาหาร
export default function FoodsPage() {
  const [foods, setFoods] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('ทั้งหมด'); 
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFoods, setSelectedFoods] = useState([]); 
  const [nutrients, setNutrients] = useState(null);
  const [error, setError] = useState(''); 

  // useEffect สำหรับดึงข้อมูลเมื่อ component โหลดครั้งแรก
  useEffect(() => {
    async function fetchData() {
      const data = await getData(); 
      setFoods(data); 
      setIsLoading(false);
    }
    fetchData(); 
  }, []); 

  const categories = ['ทั้งหมด', ...new Set(foods.map(food => food.category))];

  // กรองรายการอาหารตามหมวดหมู่ที่เลือก
  const filteredFoods = categoryFilter === 'ทั้งหมด'
    ? foods 
    : foods.filter(food => food.category === categoryFilter);

  // ฟังก์ชันสำหรับจัดการการเลือก/ยกเลิกเลือกอาหาร
  const handleSelectFood = (food) => {
    setSelectedFoods((prev) => {
      if (prev.some((f) => f.food_id === food.food_id)) {
        return prev.filter((f) => f.food_id !== food.food_id);
      } else {
        return [...prev, food];
      }
    });
    setNutrients(null); 
  };

  // ฟังก์ชันสำหรับคำนวณผลรวมสารอาหารจากอาหารที่เลือก
  const calculateNutrients = () => {
    if (selectedFoods.length === 0) {
      setError('กรุณาเลือกอาหารอย่างน้อยหนึ่งรายการ'); 
      setNutrients(null); 
      return;
    }
    
    // คำนวณผลรวมสารอาหารจากอาหารที่เลือก
    const total = selectedFoods.reduce(
      (acc, food) => ({
        protein: acc.protein + (Number(food.protein) || 0),
        fat: acc.fat + (Number(food.fat) || 0),
        carbohydrates: acc.carbohydrates + (Number(food.carbohydrates) || 0),
        fiber: acc.fiber + (Number(food.fiber) || 0),
        sugar: acc.sugar + (Number(food.sugar) || 0),
        sodium: acc.sodium + (Number(food.sodium) || 0),
      }),
      { protein: 0, fat: 0, carbohydrates: 0, fiber: 0, sugar: 0, sodium: 0 } 
    );
    
    setNutrients(total); 
    setError(''); 
  };

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

      {/* แสดงข้อความสถานะหรือรายการอาหาร */}
      {isLoading ? (
        <p className="message">กำลังโหลด...</p> 
      ) : filteredFoods.length === 0 ? (
        <p className="message">ไม่พบข้อมูลอาหาร</p> 
      ) : (
        <>
          <div className="food-grid">
            {filteredFoods.map(food => (
              <div key={food.food_id} className="food-card">
                <div className="food-select">
                  <input
                    type="checkbox"
                    id={`food-${food.food_id}`}
                    checked={selectedFoods.some((f) => f.food_id === food.food_id)} 
                    onChange={() => handleSelectFood(food)} 
                  />
                </div>
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
                      <li>โปรตีน: {food.protein ?? 'N/A'} กรัม</li>
                      <li>ไขมัน: {food.fat ?? 'N/A'} กรัม</li>
                      <li>คาร์โบไฮเดรต: {food.carbohydrates ?? 'N/A'} กรัม</li>
                      <li>ไฟเบอร์: {food.fiber ?? 'N/A'} กรัม</li>
                      <li>น้ำตาล: {food.sugar ?? 'N/A'} กรัม</li>
                      <li>โซเดียม: {food.sodium ?? 'N/A'} มก.</li>
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ส่วนสำหรับคำนวณสารอาหาร */}
          <div className="nutrient-calculator">
            <button onClick={calculateNutrients} className="calculate-button">
              คำนวณสารอาหาร
            </button>
            <button onClick={() => { setSelectedFoods([]); setNutrients(null); setError(''); }} className="clear-button">
              ล้างการเลือก
            </button>
            {error && <p className="error">{error}</p>}
            {selectedFoods.length > 0 && (
              <div className="selected-foods">
                <h3>อาหารที่เลือก:</h3>
                <ul>
                  {selectedFoods.map((food) => (
                    <li key={food.food_id}>{food.food_name}</li>
                  ))}
                </ul>
              </div>
            )}
            {nutrients && (
              <div className="nutrient-result">
                <h3>สารอาหารรวม:</h3>
                <ul>
                  <li>โปรตีน: {(nutrients.protein || 0).toFixed(2)} กรัม</li>
                  <li>ไขมัน: {(nutrients.fat || 0).toFixed(2)} กรัม</li>
                  <li>คาร์โบไฮเดรต: {(nutrients.carbohydrates || 0).toFixed(2)} กรัม</li>
                  <li>ไฟเบอร์: {(nutrients.fiber || 0).toFixed(2)} กรัม</li>
                  <li>น้ำตาล: {(nutrients.sugar || 0).toFixed(2)} กรัม</li>
                  <li>โซเดียม: {(nutrients.sodium || 0).toFixed(2)} มก.</li>
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}