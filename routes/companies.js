const express = require("express");
const router = express.Router();
const db = require("../db");

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
        const results = await db.query( `SELECT * FROM companies 
                                   WHERE code=$1`, [code]);
    
        return res.json({company: results.rows});
    } 
    catch(e) {
        next(e);
    }

});

router.post("/", async (req, res, next) => {
    try {
        const {code, name, description} = req.body;
        const results = await db.query(`INSERT INTO companies VALUES ($1, $2, $3) 
                                        RETURNING code, name, description`, 
                                    [code, name, description]);
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
