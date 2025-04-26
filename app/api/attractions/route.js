import { mysqlPool } from "@/utils/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const promisePool = mysqlPool.promise();
    
    const [rows] = await promisePool.query(`
      SELECT 
        f.food_id,
        f.food_name,
        f.category,
        f.serving_size,
        f.image_url,
        n.protein,
        n.fat,
        n.carbohydrates,
        n.fiber,
        n.sugar,
        n.sodium
      FROM foods f
      JOIN nutrients n ON f.food_id = n.food_id
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Database query error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
