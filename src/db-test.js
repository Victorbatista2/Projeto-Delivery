import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// IMPORTANT: Replace with your actual database connection details
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM restaurants');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json({ error: 'Failed to fetch restaurants' }, { status: 500 });
  }
}