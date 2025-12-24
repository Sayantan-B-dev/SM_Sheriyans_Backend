const request = require('supertest')
const app = require('../app.js')

describe("GET /", () => {
    it(
        "Should return 200 and message", async () => {
            const res = await request(app).get('/');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("message", "Express server running");
        }
    )
})

describe("POST /api/auth/register", () => {
    it("should register a user and return 201 with user data", async () => {
        const res = await request(app).post("/api/auth/register").send({
            username: "testuser",
            email: "testuser@email.com",
            password: "password"
        })

        expect(res.statusCode).toBe(201)
        expect(res.body).toHaveProperty("message","User Registered Succesfully");
        expect(res.body).toHaveProperty("user");
        expect(res.body.user).toHaveProperty("username","testuser");
        expect(res.body.user).toHaveProperty("email","testuser@email.com");
    })
})