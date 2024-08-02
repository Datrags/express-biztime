process.env.NODE_ENV = "test";
const request = require("supertest");

const app = require("../app");
const db = require("../db");

beforeAll(async function(){

    let result = await db.query(`
        INSERT INTO companies (code, name, description)
        VALUES ('sega', 'Sega', 'Japanese Video Game and Arcade Machine Company')
        RETURNING code, name, description`);
    
    sega = result.rows[0];

})

afterAll(async function() {
    await db.query("DELETE FROM companies");
    await db.end();
})

describe("GET /companies", ()=>{
    test("returns a list of companies", async ()=> {
        const res = await request(app).get("/companies");
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("companies");
    })

    test("returns a company with invoices", async ()=>{
        const res = await request(app).get("/companies/sega");
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("company");
        expect(res.body.company).toHaveProperty("code", "sega");
        expect(res.body.company).toHaveProperty("name", "Sega");
    })

    test("returns 404 if company doesnt exist", async ()=> {
        const res = await request(app).get("/companies/springboard");
        expect(res.statusCode).toBe(404);
    })
})

describe("POST /companies", () => {
    test("creates new company", async ()=>{
        const nin = {
            code: "nin", 
            name: "Nintendo", 
            description:"Japanese Videogame Company"
        }
        const res = await request(app).post("/companies").send(nin);
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({company: nin});
    })

    test(`"slugify" company code`, async ()=>{
        const ab = {
            code: "act bliz", 
            name: "Activision-Blizzard", 
            description:"US Based Videogame Company"
        }
        const res = await request(app).post("/companies").send(ab);
        expect(res.statusCode).toBe(201);
        expect(res.body.company).toHaveProperty("code", "act_bliz");
    })
})

describe("PUT /companies/:code", () => {
    test("updates existing company", async ()=>{
        const body = {
            name: "Ages",
            description: "Sega backwards"            
        }

        const res = await request(app).put("/companies/sega").send(body);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({company: {
            code: "sega",
            name: "Ages",
            description: "Sega backwards"
        }});
    });

    test("returns 404 if company not found", async ()=> {
        const res = await request(app)
                            .put("/companies/springboard").send({
                                name: "bruh", description: "moment"
                            })
        expect(res.statusCode).toBe(404);
    })
})

describe("DELETE /companies/:code", () => {
    test("deletes company", async () => {
        const res = await request(app).delete("/companies/sega");
        expect(res.body).toEqual({status: "deleted"});

    })
})