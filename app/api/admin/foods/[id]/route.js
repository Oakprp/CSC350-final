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

export async function DELETE(request, { params }) {
  if (!authenticate(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const foodId = params.id;
  if (!foodId || isNaN(foodId)) {
    return NextResponse.json({ error: 'Invalid food ID' }, { status: 400 });
  }
  console.log('DELETE request received for foodId:', foodId);
  console.log('Request headers:', Object.fromEntries(request.headers.entries()));
  try {
    const promisePool = mysqlPool.promise();
    const [result] = await promisePool.query('DELETE FROM foods WHERE food_id = ?', [foodId]);
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Food not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Food deleted' });
  } catch (error) {
    console.error('Database error in DELETE:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  if (!authenticate(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const foodId = params.id;
  if (!foodId || isNaN(foodId)) {
    return NextResponse.json({ error: 'Invalid food ID' }, { status: 400 });
  }
  try {
    const {
      food_name, category, serving_size, image_url,
      protein, fat, carbohydrates, fiber, sugar, sodium
    } = await request.json();
    if (!food_name || !category || !serving_size) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const promisePool = mysqlPool.promise();
    const [foodResult] = await promisePool.query(
      'UPDATE foods SET food_name = ?, category = ?, serving_size = ?, image_url = ? WHERE food_id = ?',
      [food_name, category, serving_size, image_url || null, foodId]
    );
    if (foodResult.affectedRows === 0) {
      return NextResponse.json({ error: 'Food not found' }, { status: 404 });
    }
    const [existingNutrients] = await promisePool.query(
      'SELECT * FROM nutrients WHERE food_id = ?',
      [foodId]
    );
    if (existingNutrients.length > 0) {
      await promisePool.query(
        'UPDATE nutrients SET protein = ?, fat = ?, carbohydrates = ?, fiber = ?, sugar = ?, sodium = ? WHERE food_id = ?',
        [protein || null, fat || null, carbohydrates || null, fiber || null, sugar || null, sodium || null, foodId]
      );
    } else {
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