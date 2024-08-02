process.env.NODE_ENV = "test";
const request = require("supertest");

const app = require("../app");
const db = require("../db");

beforeAll(async function(){

    let compRes = await db.query(`
        INSERT INTO companies (code, name, description)
        VALUES ('sega', 'Sega', 'Japanese Video Game and Arcade Machine Company')
        RETURNING code, name, description`);
    
    sega = compRes.rows[0];

    let invRes = await db.query(`
        INSERT INTO invoices (id, comp_code, amt, paid, paid_date)
        VALUES 
            (1, 'sega', 100, false, null),
            (2, 'sega', 200, false, null)
        RETURNING *`);
    
    sega.invoices = invRes.rows;

})

afterAll(async function() {
    await db.query("DELETE FROM invoices");
    await db.query("DELETE FROM companies");
    await db.end();
})

describe("GET /invoices", ()=>{
    test("returns a list of invoices", async ()=> {
        const res = await request(app).get("/invoices");
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("invoices");
        console.log(res.body);
    })

    test("returns an invoice", async ()=>{
        const res = await request(app).get("/invoices/1");
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("invoice");
        expect(res.body.invoice).toHaveProperty("comp_code", "sega");
        expect(res.body.invoice).toHaveProperty("amt", 100);
    })

    test("returns 404 if company doesnt exist", async ()=> {
        const res = await request(app).get("/invoices/500");
        expect(res.statusCode).toBe(404);
    })
})

describe("POST /invoices", () => {
    test("creates new invoice", async ()=>{
        const newInv = {
            comp_code: "sega", 
            amt: 500
        }
        const res = await request(app).post("/invoices").send(newInv);
        expect(res.statusCode).toBe(201);
        expect(res.body.invoice).toBeDefined();
        expect(res.body.invoice).toHaveProperty("comp_code", "sega");
        expect(res.body.invoice).toHaveProperty("amt", 500);

    })
})

describe("PUT /invoices/:code", () => {
    test("updates existing invoice", async ()=>{
        const body = {
            amt: 1000,            
        }

        const res = await request(app).put("/invoices/2").send(body);
        expect(res.statusCode).toBe(200);
        expect(res.body.invoice).toBeDefined()
        expect(res.body.invoice).toHaveProperty("comp_code", "sega");
        expect(res.body.invoice).toHaveProperty("amt", 1000);

    });

    test("returns 404 if invoice not found", async ()=> {
        const res = await request(app)
                            .put("/invoices/500").send({
                                amt: 1
                            });
        expect(res.statusCode).toBe(404);
    })
})

describe("DELETE /invoices/:code", () => {
    test("deletes invoice", async () => {
        const res = await request(app).delete("/invoices/1");
        expect(res.body).toEqual({status: "deleted"});

    })
})