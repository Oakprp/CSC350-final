import { mysqlPool } from '@/utils/db'; //เชื่อมต่อกับฐานข้อมูล
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// ฟังก์ชันสำหรับตรวจสอบการยืนยันตัวตนของผู้ใช้ โดยใช้ JWT token
const authenticate = (request) => {
  const token = request.headers.get('authorization')?.split(' ')[1] || request.cookies.get('token')?.value;
  
  if (!token) {
    console.log('No token found in request'); 
    return false; 
  }
  
  try {
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Token verified successfully'); 
    return true; // คืนค่า true เพื่อระบุว่าผ่านการยืนยันตัวตน
  } catch (error) {
    console.log('Token verification failed:', error.message); 
    return false; 
  }
};

export async function DELETE(request, { params }) {
  // ตรวจสอบการยืนยันตัวตน
  if (!authenticate(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const foodId = params.id;
  
  // ตรวจสอบว่า foodId ถูกต้องหรือไม่
  if (!foodId || isNaN(foodId)) {
    return NextResponse.json({ error: 'Invalid food ID' }, { status: 400 });
  }

  console.log('DELETE request received for foodId:', foodId); 
  console.log('Request headers:', Object.fromEntries(request.headers.entries()));

  try {
    // สร้าง promise pool สำหรับการ query ฐานข้อมูล
    const promisePool = mysqlPool.promise();
    
    // ลบข้อมูลอาหารจากตาราง foods โดยใช้ food_id
    const [result] = await promisePool.query('DELETE FROM foods WHERE food_id = ?', [foodId]);
    
    // ตรวจสอบว่ามีการลบข้อมูลหรือไม่
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Food not found' }, { status: 404 }); // ส่ง 404 Not Found ถ้าไม่พบอาหาร
    }
    
    return NextResponse.json({ message: 'Food deleted' });
  } catch (error) {
    console.error('Database error in DELETE:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// API handler สำหรับ PUT request เพื่ออัปเดตข้อมูลอาหารตาม ID
export async function PUT(request, { params }) {
  if (!authenticate(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const foodId = params.id;
  
  // ตรวจสอบว่า foodId ถูกต้องหรือไม่
  if (!foodId || isNaN(foodId)) {
    return NextResponse.json({ error: 'Invalid food ID' }, { status: 400 }); // ส่ง 400 Bad Request ถ้า ID ไม่ถูกต้อง
  }

  try {
    // ดึงข้อมูลจาก request body (ข้อมูลอาหารที่ต้องการอัปเดต)
    const {
      food_name, category, serving_size, image_url,
      protein, fat, carbohydrates, fiber, sugar, sodium
    } = await request.json();

    // ตรวจสอบว่ามีฟิลด์ที่จำเป็นหรือไม่ (food_name, category, serving_size)
    if (!food_name || !category || !serving_size) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 }); // ส่ง 400 ถ้าขาดฟิลด์
    }

    const promisePool = mysqlPool.promise();
    
    // อัปเดตข้อมูลในตาราง foods
    const [foodResult] = await promisePool.query(
      'UPDATE foods SET food_name = ?, category = ?, serving_size = ?, image_url = ? WHERE food_id = ?',
      [food_name, category, serving_size, image_url || null, foodId]
    );

    // ตรวจสอบว่ามีการอัปเดตข้อมูลหรือไม่
    if (foodResult.affectedRows === 0) {
      return NextResponse.json({ error: 'Food not found' }, { status: 404 });
    }

    // ตรวจสอบว่ามีข้อมูลสารอาหารในตาราง nutrients หรือไม่
    const [existingNutrients] = await promisePool.query(
      'SELECT * FROM nutrients WHERE food_id = ?',
      [foodId]
    );

    // ถ้ามีข้อมูลสารอาหารอยู่แล้ว อัปเดตข้อมูล
    if (existingNutrients.length > 0) {
      await promisePool.query(
        'UPDATE nutrients SET protein = ?, fat = ?, carbohydrates = ?, fiber = ?, sugar = ?, sodium = ? WHERE food_id = ?',
        [protein || null, fat || null, carbohydrates || null, fiber || null, sugar || null, sodium || null, foodId]
      );
    } else {
      // ถ้ายังไม่มีข้อมูลสารอาหาร เพิ่มข้อมูลใหม่
      await promisePool.query(
        'INSERT INTO nutrients (food_id, protein, fat, carbohydrates, fiber, sugar, sodium) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [foodId, protein || null, fat || null, carbohydrates || null, fiber || null, sugar || null, sodium || null]
      );
    }

    return NextResponse.json({ message: 'Food updated' });
  } catch (error) {
    console.error('Database error in PUT:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}