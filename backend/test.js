const express = require("express");
const app = express();
app.use(express.json());

function logger(req, res, next) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
}

app.use(logger);

app.get("/get", (req, res) => {
  res.send("working");
});

app.post("/add", (req, res) => {
  res.send("post request");
});
app.listen(5001, (req, res) => {
  console.log("server is runing");
});
