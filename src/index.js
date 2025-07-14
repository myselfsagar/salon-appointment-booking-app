const express = require("express");
const app = express();
require("dotenv").config();
const mainRoute = require("./routes/index");

app.use(express.json());

app.use("/", mainRoute);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("Listening on PORT", PORT);
});
