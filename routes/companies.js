const express = require('express');
const ExpressError = require('../expressError');
const slugify = require('slugify');
const db = require('../db');
const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT code, name FROM companies`);
        return res.json({companies: results.rows});
    } catch (e) {
        return next(e);
    }
})

router.get('/:code', async (req, res, next) => {
    try {
        const {code} = req.params;
        const cResults = await db.query('SELECT * FROM companies WHERE code=$1', [code]);
        if (cResults.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${code}`, 404);
        } else {
            const iResults = await db.query('SELECT id FROM invoices WHERE comp_code=$1', [code]);
            const company = cResults.rows[0];
            company.invoices = iResults.rows.map(row => row.id);
            return res.status(200).json({company: company});
        }
    } catch (e) {
        return next(e);
    }
})

router.post('/', async (req, res, next) => {
    try {
        const {name, description} = req.body;
        const code = slugify(name, {remove: /[*+~.()'"!:@]/g, lower: true})
        const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', [code, name, description]);
        return res.status(201).json({company: results.rows[0]});
    } catch (e) {
        return next(e);
    }
})

router.put('/:code', async (req, res, next) => {
    try {
        const {code} = req.params;
        const {name, description} = req.body;
        const results = await db.query('UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description', [code, name, description]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${code}`, 404);
        } else {
            return res.status(201).json({company: results.rows[0]});
        }
    } catch (e) {
        return next(e);
    }
})

router.delete('/:code', async (req, res, next) => {
    try {
        const {code} = req.params;
        const results = await db.query('DELETE FROM companies WHERE code=$1 RETURNING code', [code]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${code}`, 404);
        } else {
            return res.json({status: 'deleted'});
        }
    } catch (e) {
        return next(e);
    }
})

module.exports = router;