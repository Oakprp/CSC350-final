import mysql from 'mysql2';

export const mysqlPool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'csc350-foodproject',
});
