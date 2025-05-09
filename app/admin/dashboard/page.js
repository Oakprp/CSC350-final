'use client';

import React, { useState, useEffect } from 'react'; 
import { useRouter } from 'next/navigation';
import { FiLogOut } from 'react-icons/fi'; 
import '../styles.css'; 

export default function AdminDashboard() {
  // State สำหรับเก็บรายการอาหารทั้งหมดที่ดึงมาจาก API
  const [foods, setFoods] = useState([]);
  
  // State สำหรับเก็บข้อมูลฟอร์ม (ใช้ทั้งเพิ่มและแก้ไขอาหาร)
  const [form, setForm] = useState({
    food_name: '',
    category: '', 
    serving_size: '', 
    image_url: '', 
    protein: '', 
    fat: '', 
    carbohydrates: '', 
    fiber: '', 
    sugar: '', 
    sodium: '' 
  });
  
  // เก็บ ID ของอาหารที่กำลังแก้ไข
  const [editingId, setEditingId] = useState(null);
  
  // error
  const [error, setError] = useState('');
  
  // เปลี่ยนหน้า
  const router = useRouter();

  // ดึงข้อมูลอาหารเมื่อ component โหลดครั้งแรก
  useEffect(() => {
    fetchFoods(); // เรียกฟังก์ชันเพื่อดึงข้อมูลอาหารจาก API
  }, []);

  // ดึงข้อมูลอาหารทั้งหมดจาก API
  const fetchFoods = async () => {
    try {
      console.log('Fetching foods...'); 
      const res = await fetch('/api/admin/foods', {
        method: 'GET',
        credentials: 'include',
      });
      console.log('Fetch foods response status:', res.status); 
      if (res.ok) { // ถ้า response สำเร็จ
        const data = await res.json(); // แปลง response เป็น JSON
        setFoods(data); // อัปเดต state ด้วยข้อมูลอาหารที่ได้
        setError(''); // ล้างข้อความ error
      } else {
        const text = await res.text(); // ดึง response เป็น text ถ้าไม่ใช่ JSON
        console.error('Fetch foods response text:', text); // Log ข้อผิดพลาด
        try {
          const data = JSON.parse(text); // พยายาม parse เป็น JSON
          setError(data.error || 'Failed to fetch foods'); // แสดงข้อผิดพลาดจาก API
        } catch {
          setError('Received non-JSON response. Check if redirected to login.');
        }
      }
    } catch (err) {
      console.error('Fetch foods error:', err); // Log error ถ้าการ fetch ล้มเหลว
      setError('An error occurred while fetching foods'); // แสดงข้อผิดพลาดทั่วไป
    }
  };

  // สำหรับจัดการการเพิ่มหรือแก้ไขอาหาร
  const handleSubmit = async (e) => {
    e.preventDefault(); // ป้องกันการรีเฟรชหน้าเมื่อกด submit
    // กำหนด URL และ method ตามสถานะ (เพิ่มหรือแก้ไข)
    const url = editingId ? `/api/admin/foods/${editingId}` : '/api/admin/foods';
    const method = editingId ? 'PUT' : 'POST';
    try {
      console.log('Submitting form:', form, 'Method:', method, 'URL:', url);
      // ส่ง request ไปยัง API เพื่อเพิ่มหรือแก้ไขอาหาร
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json', // กำหนดประเภทข้อมูลเป็น JSON
        },
        credentials: 'include', 
        body: JSON.stringify({
          ...form,
          protein: form.protein ? parseFloat(form.protein) : null,
          fat: form.fat ? parseFloat(form.fat) : null,
          carbohydrates: form.carbohydrates ? parseFloat(form.carbohydrates) : null,
          fiber: form.fiber ? parseFloat(form.fiber) : null,
          sugar: form.sugar ? parseFloat(form.sugar) : null,
          sodium: form.sodium ? parseFloat(form.sodium) : null
        }),
      });
      console.log('Submit response status:', res.status); 
      if (res.ok) { // ถ้าการส่งสำเร็จ
        // รีเซ็ตฟอร์มหลังจากส่งสำเร็จ
        setForm({
          food_name: '',
          category: '',
          serving_size: '',
          image_url: '',
          protein: '',
          fat: '',
          carbohydrates: '',
          fiber: '',
          sugar: '',
          sodium: ''
        });
        setEditingId(null); // ล้างสถานะการแก้ไข
        fetchFoods(); // ดึงข้อมูลอาหารใหม่เพื่ออัปเดตหน้า
        setError(''); // ล้างข้อความ error
      } else {
        const text = await res.text();
        console.error('Submit response text:', text);
        try {
          const data = JSON.parse(text); 
          setError(data.error || 'Failed to save food'); 
        } catch {
          setError('Received non-JSON response. Check if redirected to login.');
        }
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('An error occurred while saving food');
    }
  };

  // สำหรับเตรียมเพื่อแก้ไขอาหาร
  const handleEdit = (food) => {
    setForm({
      food_name: food.food_name,
      category: food.category,
      serving_size: food.serving_size,
      image_url: food.image_url || '',
      protein: food.protein || '',
      fat: food.fat || '',
      carbohydrates: food.carbohydrates || '',
      fiber: food.fiber || '',
      sugar: food.sugar || '',
      sodium: food.sodium || ''
    });
    setEditingId(food.food_id);
  };

  // สำหรับลบอาหาร
  const handleDelete = async (id) => {
    if (!id || isNaN(id)) { 
      setError('Invalid food ID');
      console.error('Invalid food ID:', id);
      return;
    }
    if (!confirm('Are you sure you want to delete this food?')) return;
    try {
      console.log('Deleting food with ID:', id); 
      const url = `/api/admin/foods/${id}`; 
      console.log('DELETE URL:', url);
      // ส่ง DELETE request ไปยัง API
      const res = await fetch(url, {
        method: 'DELETE',
        credentials: 'include', 
      });
      console.log('Delete response status:', res.status); 
      console.log('Delete response headers:', Object.fromEntries(res.headers.entries())); 
      if (res.ok) { 
        fetchFoods(); 
        setError(''); 
      } else {
        const text = await res.text(); 
        console.error('Delete response text:', text); 
        try {
          const data = JSON.parse(text); 
          setError(data.error || 'Failed to delete food'); 
        } catch {
          setError('Received non-JSON response. Likely a 404 or redirect.');
        }
      }
    } catch (err) {
      console.error('Delete error:', err); 
      setError('An error occurred while deleting food');
    }
  };

  // สำหรับ logout
  const handleLogout = () => {
    console.log('Logging out...'); 
    document.cookie = 'token=; Path=/; Max-Age=0';
    router.push('/attractions'); // เปลี่ยนหน้าไปยังหน้าแรก
  };

  // สำหรับแสดงหน้า dashboard
  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>จัดการรายการอาหาร</h1>
        <button onClick={handleLogout} className="logout-button">
          <FiLogOut size={20} />
          <span>Logout</span>
        </button>
      </header>
      <div className="dashboard-container">
        {/* เปลี่ยนตามสถานะแก้ไข/เพิ่ม */}
        <h2>{editingId ? 'Edit Food' : 'Add New Food'}</h2>
        {/* สำหรับเพิ่มหรือแก้ไขอาหาร */}
        <form onSubmit={handleSubmit} className="food-form">
          <div className="form-group">
            <label htmlFor="food_name">Food Name:</label>
            <input
              type="text"
              id="food_name"
              value={form.food_name}
              onChange={(e) => setForm({ ...form, food_name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="category">Category:</label>
            <input
              type="text"
              id="category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="serving_size">Serving Size:</label>
            <input
              type="text"
              id="serving_size"
              value={form.serving_size}
              onChange={(e) => setForm({ ...form, serving_size: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="image_url">Image URL:</label>
            <input
              type="url"
              id="image_url"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="protein">Protein (g):</label>
            <input
              type="number"
              id="protein"
              value={form.protein}
              onChange={(e) => setForm({ ...form, protein: e.target.value })}
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label htmlFor="fat">Fat (g):</label>
            <input
              type="number"
              id="fat"
              value={form.fat}
              onChange={(e) => setForm({ ...form, fat: e.target.value })}
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label htmlFor="carbohydrates">Carbohydrates (g):</label>
            <input
              type="number"
              id="carbohydrates"
              value={form.carbohydrates}
              onChange={(e) => setForm({ ...form, carbohydrates: e.target.value })}
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label htmlFor="fiber">Fiber (g):</label>
            <input
              type="number"
              id="fiber"
              value={form.fiber}
              onChange={(e) => setForm({ ...form, fiber: e.target.value })}
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label htmlFor="sugar">Sugar (g):</label>
            <input
              type="number"
              id="sugar"
              value={form.sugar}
              onChange={(e) => setForm({ ...form, sugar: e.target.value })}
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label htmlFor="sodium">Sodium (mg):</label>
            <input
              type="number"
              id="sodium"
              value={form.sodium}
              onChange={(e) => setForm({ ...form, sodium: e.target.value })}
              step="0.01"
            />
          </div>
          <button type="submit" className="submit-button">
            {editingId ? 'Update Food' : 'Add Food'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        <h2>Food List</h2>
        <div className="food-grid">
          {foods.map(food => (
            <div key={food.food_id} className="food-card">
              <h3>{food.food_name}</h3>
              <p><strong>Category:</strong> {food.category}</p>
              <p><strong>Serving Size:</strong> {food.serving_size}</p>
              {food.image_url && <img src={food.image_url} alt={food.food_name} className="food-image" />}
              <p><strong>Nutrients:</strong></p>
              <ul>
                <li>Protein: {food.protein ?? 'N/A'} g</li>
                <li>Fat: {food.fat ?? 'N/A'} g</li>
                <li>Carbohydrates: {food.carbohydrates ?? 'N/A'} g</li>
                <li>Fiber: {food.fiber ?? 'N/A'} g</li>
                <li>Sugar: {food.sugar ?? 'N/A'} g</li>
                <li>Sodium: {food.sodium ?? 'N/A'} mg</li>
              </ul>
              <div className="food-actions">
                <button onClick={() => handleEdit(food)} className="edit-button">Edit</button>
                <button onClick={() => handleDelete(food.food_id)} className="delete-button">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}