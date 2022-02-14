const express = require("express");
const bodyParser = require("body-parser");

const routes = require("./src/routes/index.js");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get("/", (res, req) => {
    return req.json({
        message: "Okay"
    }).send();
});

app.use("/api", routes);

module.exports = app;