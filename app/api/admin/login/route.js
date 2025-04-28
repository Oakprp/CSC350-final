import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const adminCredentials = {
  username: 'admin',
  password: bcrypt.hashSync('admincsc350', 10),
};

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    console.log('Login attempt for username:', username);
    if (!username || !password) {
      console.log('Missing username or password');
      return NextResponse.json({ error: 'Missing username or password' }, { status: 400 });
    }
    if (username !== adminCredentials.username) {
      console.log('Invalid username:', username);
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }
    const isPasswordValid = bcrypt.compareSync(password, adminCredentials.password);
    console.log('Password valid:', isPasswordValid);
    if (!isPasswordValid) {
      console.log('Invalid password for username:', username);
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });
    console.log('Token generated:', token);
    return NextResponse.json({ message: 'Login successful' }, {
      status: 200,
      headers: {
        'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict`,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}