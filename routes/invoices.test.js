process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

beforeEach(async () => {
    await db.query('DELETE FROM companies');
    await db.query('DELETE FROM invoices');
    await db.query(`INSERT INTO companies (code, name, description) VALUES ('fing', 'Fang Boi', 'Good Boy Inc') RETURNING code, name, description`);

    await db.query(`INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date) VALUES ('fing', '500', 'true', '2024-01-30', '2024-01-31') RETURNING id`);
})

afterEach(async () => {
    await db.query('DELETE FROM invoices');
})

afterAll(async () => {
    await db.end();
})

describe('GET /', () => {
    test('GET list of all invoices "The fang test company invoices"', async () => {
        const res = await request(app).get('/invoices');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({companies: [{id: 1, comp_code: 'fing', amt: '500', paid: 'true', add_date: '2024-01-30', paid_date: '2024-01-31'}]});
    })
})

describe('GET /1', () => {
    test('Gets a single invoice', async () => {
        const res = await request(app).get('/invoices/1');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ invoice: [{id: 1, amt: '500', paid: 'true', add_date: '2024-01-30', paid_date: '2024-01-31', company: {code: 'fing', name: 'Fang Boi', description: 'Good Boy Inc'}}]});
    })
    test('Responds with 404 for invalid id', async () => {
        const res = await request(app).get('/invoices/999999999');
        expect(res.statusCode).toBe(404);
    })
})

describe('POST /', () => {
    test('Adds an invoice', async () => {
        const res = await request(app).post('/invoices').send({comp_code: 'fing', amt: 900});
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({invoice: {id: 2, comp_code: 'fing', amt: 900, paid: false, add_date: '2024-01-31', paid_date: null}});
    })
})

describe('PUT /:id', () => {
    test('Updates an invoice', async () => {
        const res = await request(app).put(`/invoices/1`).send({amt: 5000, paid: 'false'});
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({invoice: {id: 1, comp_code: 'fing', amt: 5000, paid: false, add_date: '2024-01-30', paid_date: '2024-01-31'}});
    })
    test('Responds with 404 for invalid code', async () => {
        const res = await request(app).put('/invoices/9999999').send({amt: 99999999999999999999999});
        expect(res.statusCode).toEqual(404);
    })
})

describe('DELETE /:id', () => {
    test('Deletes a single invoice', async () => {
        const res = await request(app).delete(`/invoices/1`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({status: 'deleted'});
    })
    test('Responds with 404 for invalid id', async () => {
        const res = await request(app).delete('/invoices/99999');
        expect(res.statusCode).toEqual(404);
    })
})