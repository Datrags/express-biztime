const express = require("express");
const router = express.Router();
const db = require("../db");

const slugify = require("slugify");

router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`
            SELECT code, industry FROM industries`);

        return res.json({industry: results.rows});
    }
    catch(e) {
        next(e);
    }
})

router.post("/", async (req, res, next) => {
    try {
        const {code, industry} = req.body;
        const code_slug = slugify(code, {
            replacement: '_',
            lower: true
        });
        const results = await db.query(`
            INSERT INTO industries 
            VALUES ($1, $2) 
            RETURNING code, industry`, 
        [code_slug, industry]);

        return res.status(201).json({industry: results.rows[0]});
    }
    catch(e) {
        next(e);
    }
});

router.post("/:comp_code", async (req, res, next) => {
    try {
        const {ind_code} = req.body;
        const {comp_code} = req.params;

        const results = await db.query(`
            INSERT INTO company_industries (comp_code, ind_code)
            VALUES ($1, $2)
            RETURNING comp_code, ind_code`,
        [comp_code, ind_code]);

        return res.status(201).json({added: results.rows[0]});
    }
    catch(e) {
        next(e);
    }
})

module.exports = router;