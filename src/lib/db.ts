import { Pool } from 'pg';

// Use connection pooling for better performance in serverless/Next.js
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Neon typically requires SSL
    },
    max: 10,
    idleTimeoutMillis: 0,
    connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});


export const query = async (text: string, params?: any[]) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        // console.log('executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (err) {
        console.error('Database Query Error:', err);
        throw err;
    }
};

export const getClient = () => pool.connect();
