const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT id, comp_code FROM invoices`);

        return res.json({invoices: results.rows});
    }
    catch(e) {
        next(e);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const {id} = req.params;
        const results = await db.query(`SELECT * FROM invoices
                                        WHERE id=$1`, [id]);

        return res.json({invoice: results.rows});
    }
    catch(e) {
        next(e);
    }
});


router.post("/", async (req, res, next) => {
    try {
        const {comp_code, amt} = req.body;
        const results = await db.query(`INSERT INTO invoices (comp_code, amt)
                                        VALUES ($1, $2) 
                                        RETURNING *`, 
                                    [comp_code, amt]);
        return res.status(201).json({invoice: results.rows[0]});
    }
    catch(e) {
        next(e);
    }
});

router.put("/:id", async (req, res, next) => {
    try{
        const {amt} = req.body;
        const {id} = req.params;

        const results = await db.query(`UPDATE invoices
                                        SET amt=$1
                                        WHERE id=$2
                                        RETURNING *`,
                                    [amt, id]);

        return res.json({invoice: results.rows[0]});
    }
    catch(e) {
        next(e);
    }
});

router.delete("/:id", async (req, res, next) => {
    try {
        const {id} = req.params;
        const result = await db.query(`DELETE FROM invoices WHERE id=$1`, [id]);
        
        return res.json({status: "deleted"});
    }
    catch(e) {
        next(e);
    }
})
module.exports = router;