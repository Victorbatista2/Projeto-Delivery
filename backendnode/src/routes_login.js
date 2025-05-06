require("dotenv").config();

const db = require("./db");

const port = process.env.PORT;

const express = require("express");

const app = express();

app.use(express.json());

app.get("/teste", (req, res) => {
    res.json({
        message: "Funcionado"
    })
})

app.get("/usuario", async (req, res) =>{
    const Usuario = await db.selectUsers();
    res.json(Usuario);
})

app.get("/usuario/:id", async (req, res) =>{
    const Usuario = await db.selectUser(req.params.id);
    res.json(Usuario);
})

app.post("/usuario/", async (req, res) =>{
    await db.insertUsuarios(req.body);
    res.sendStatus(201);
})

app.patch("/usuario/:id", async (req, res) =>{
    await db.updateUsuarios(req.params.id, req.body);
    res.sendStatus(200);
})

app.delete("/usuario/:id", async (req, res) =>{
    await db.deleteUsuario(req.params.id, req.body);
    res.sendStatus(204);
})

app.listen(port);

console.log("Back-end rodando");