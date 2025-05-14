const express = require("express");
const cors = require("cors");
const loginRoutes = require("./routes/routes_login.js");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", loginRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});