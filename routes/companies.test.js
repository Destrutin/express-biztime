process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');



let testCompany;
beforeEach(async () => {
    console.log('Password:', typeof process.env.DB_PASSWORD, process.env.DB_PASSWORD);
    await db.query('DELETE FROM companies');
    const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ('fing', 'Fang Boi', 'Good Boy Inc') RETURNING code, name, description`);
    testCompany = result.rows[0];
})

afterAll(async () => {
    if (process.env.NODE_ENV === 'test') {
        await db.end();
    }
})

describe('GET /', () => {
    test('GET list of all companies "The fang test company"', async () => {
        const res = await request(app).get('/companies');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({companies: [{code: 'fing', name: 'Fang Boi', description: 'Good Boy Inc'}]});
    })
})

describe('GET /:code', () => {
    test('Gets a single company', async () => {
        const res = await request(app).get(`/companies/${testCompany.code}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ company: testCompany});
    })
    test('Responds with 404 for invalid code', async () => {
        const res = await request(app).get('/companies/Bad Boy');
        expect(res.statusCode).toBe(404);
    })
})

describe('POST /', () => {
    test('Adds a company', async () => {
        const res = await request(app).post('/companies').send({code: 'chonk', name: 'Chonky Boi', description: 'Chonk Boy Inc'});
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({company: {code: 'chonk', name: 'Chonky Boi', description: 'Chonk Boi Inc'}});
    })
})

describe('PUT /:code', () => {
    test('Updates a company', async () => {
        const res = await request(app).put(`/companies/${testCompany.code}`).send({name: 'OmegaChonk', description: 'Best Boi Inc'});
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({company: {code: 'fing', name: 'OmegaChonk', description: 'Best Boi Inc'}});
    })
    test('Responds with 404 for invalid code', async () => {
        const res = await request(app).put('/companies/Bad Boy').send({name: 'Not-so-good-Boy'});
        expect(res.statusCode).toEqual(404);
    })
})

describe('DELETE /:code', () => {
    test('Deletes a single company', async () => {
        const res = await request(app).delete(`/companies/${testCompany.code}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({status: 'deleted'});
    })
    test('Responds with 404 for invalid code', async () => {
        const res = await request(app).delete('/companies/Bad Boy');
        expect(res.statusCode).toEqual(404);
    })
})
