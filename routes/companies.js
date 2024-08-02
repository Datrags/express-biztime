const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");
const slugify = require("slugify");

router.get("/", async (req, res, next) => {
    try {
        const results = await db.query( `SELECT code, name FROM companies`);

        return res.json({companies: results.rows});
    }
    catch(e) {
        next(e);
    }

});


router.get("/:code", async (req, res, next) => {
    try {
        const {code} = req.params;
        const results = await db.query( `
            SELECT c.code, c.name, c.description, d.industry, 
            i.id, i.amt, i.paid  
            FROM companies AS c
            LEFT JOIN company_industries AS ci
            ON c.code = ci.comp_code
            LEFT JOIN industries AS d
            ON ci.ind_code = d.code
            LEFT JOIN invoices AS i
            ON i.comp_code = c.code
            WHERE c.code=$1`, [code]);

        if (results.rows.length === 0)
            throw new ExpressError("Company DNE", 404);

        let industries = results.rows.map(r => r.industry);
        industries = [...new Set(industries)];

        let invoices = results.rows.map (r => {
            return {
                id: r.id,
                amt: r.amt,
                paid: r.paid
            }
        })
        invoices = [...new Map(invoices.map(i => [i.id, i])).values()];
 
        const comp = results.rows[0];
        comp.industries = industries;
        comp.invoices = invoices;
        return res.json({company: comp});
    } 
    catch(e) {
        next(e);
    }

});

router.post("/", async (req, res, next) => {
    try {
        const {code, name, description} = req.body;
        const code_slug = slugify(code, {
            replacement: '_',
            lower: true
        });
        const results = await db.query(`INSERT INTO companies VALUES ($1, $2, $3) 
                                        RETURNING code, name, description`, 
                                    [code_slug, name, description]);
        return res.status(201).json({company: results.rows[0]});
    }
    catch(e) {
        next(e);
    }
});

router.put("/:code", async (req, res, next) => {
    try{
        const {name, description} = req.body;
        const {code} = req.params;

        const results = await db.query(`UPDATE companies 
                                        SET name=$1, description=$2
                                        WHERE code=$3
                                        RETURNING code, name, description`,
                                    [name, description, code]);
        if (!results.rows[0]) throw new ExpressError("company DNE", 404);
        return res.json({company: results.rows[0]});
    }
    catch(e) {
        next(e);
    }
});

router.delete("/:code", async (req, res, next) => {
    try {
        const {code} = req.params;
        const result = await db.query(`DELETE FROM companies WHERE code=$1`, [code]);
        
        return res.json({status: "deleted"});
    }
    catch(e) {
        next(e);
    }
})
module.exports = router;
