import { mysqlPool } from '@/utils/db';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken'; 

const authenticate = (request) => {
const token = request.headers.get('authorization')?.split(' ')[1] || request.cookies.get('token')?.value;
  
  if (!token) {
    console.log('No token found in request');
    return false; 
  }
  
  try {
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Token verified successfully');
    return true; 
  } catch (error) {
    console.log('Token verification failed:', error.message); 
    return false;
  }
};

// API handler สำหรับ GET request เพื่อดึงข้อมูลอาหารทั้งหมด
export async function GET(request) {
  if (!authenticate(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const promisePool = mysqlPool.promise();
    
    // ดึงข้อมูลอาหารทั้งหมดจากตาราง foods และ nutrients โดยใช้ LEFT JOIN
    const [rows] = await promisePool.query(`
      SELECT 
        f.food_id, f.food_name, f.category, f.serving_size, f.image_url,
        n.protein, n.fat, n.carbohydrates, n.fiber, n.sugar, n.sodium
      FROM foods f
      LEFT JOIN nutrients n ON f.food_id = n.food_id
    `);
    
    // ส่งข้อมูลที่ได้กลับไปยัง client ในรูปแบบ JSON
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error in GET:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// API handler สำหรับ POST request เพื่อเพิ่มอาหารใหม่
export async function POST(request) {
  if (!authenticate(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // ดึงข้อมูลจาก request body (ข้อมูลอาหารที่ต้องการเพิ่ม)
    const {
      food_name, category, serving_size, image_url,
      protein, fat, carbohydrates, fiber, sugar, sodium
    } = await request.json();

    // ตรวจสอบว่ามีฟิลด์ที่จำเป็นหรือไม่ (food_name, category, serving_size)
    if (!food_name || !category || !serving_size) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 }); 
    }

    const promisePool = mysqlPool.promise();
    
    // เพิ่มข้อมูลลงในตาราง foods
    const [foodResult] = await promisePool.query(
      'INSERT INTO foods (food_name, category, serving_size, image_url) VALUES (?, ?, ?, ?)',
      [food_name, category, serving_size, image_url || null]
    );

    // ดึง food_id ของข้อมูลที่เพิ่งเพิ่ม
    const foodId = foodResult.insertId;
    
    // เพิ่มข้อมูลสารอาหารลงในตาราง nutrients โดยใช้ food_id ที่ได้
    await promisePool.query(
      'INSERT INTO nutrients (food_id, protein, fat, carbohydrates, fiber, sugar, sodium) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [foodId, protein || null, fat || null, carbohydrates || null, fiber || null, sugar || null, sodium || null]
    );

    return NextResponse.json({ message: 'Food added', food_id: foodId }, { status: 201 });
  } catch (error) {
    console.error('Database error in POST:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}