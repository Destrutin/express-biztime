/** Database setup for BizTime. */
require('dotenv').config();
console.log('Password:', typeof process.env.DB_PASSWORD, process.env.DB_PASSWORD);

const { Client } = require('pg');

const DB_URI = (process.env.NODE_ENV === 'test')
    ? 'postgresql:///biztime_test'
    : 'postgresql:///biztime';

const client = new Client({
    connectionString: DB_URI,
    user: process.env.DB_USER,
    password: String(process.env.DB_PASSWORD),
    ssl: {
        rejectUnauthorized: false,
    }
});

if (process.env.NODE_ENV !== 'test') {
    client.connect((err) => {
        if (err) {
            console.error('Error connecting to the database:', err);
        } else {
            console.log('Connected to the database');
        }
    });
}

module.exports = client;