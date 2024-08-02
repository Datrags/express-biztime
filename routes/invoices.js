const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");


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
        if (results.rows.length === 0)
            throw new ExpressError("Invoice DNE", 404);

        return res.json({invoice: results.rows[0]});
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
        const {amt, paid} = req.body;
        if (amt === undefined || paid === undefined ) 
            throw new ExpressError("Missing amt or paid", 404);
        const {id} = req.params;
        
        const invoice = await db.query(`
            SELECT paid, paid_date FROM invoices
            WHERE id=$1`, [id]);
            
        if (invoice.rows.length === 0)
            throw new ExpressError("Invoice DNE", 404);
        const currPaid = invoice.rows[0].paid;
        const currPaidDate = invoice.rows[0].paid_date;
        let paid_date;
        
        //If paying unpaid invoice: sets paid_date to today
        if (paid && !currPaid) paid_date = "CURRENT_TIMESTAMP";
        //If un-paying: sets paid_date to null
        else if (!paid && currPaid) paid_date = "NULL";
        // Else: keep current paid_date
        else paid_date = currPaidDate;


        const results = await db.query(
            `UPDATE invoices
            SET amt=$1, paid_date=$3
            WHERE id=$2
            RETURNING *`,
        [amt, id, paid_date]);

        
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