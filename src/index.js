const express = require("express");
require("dotenv").config();
const routes = require("./routes");
const errorMiddleware = require("./middlewares/errorMiddleware");
const app = express();

// Set the timezone for the entire application
process.env.TZ = "Asia/Kolkata";

//connect to db
const dbConnection = require("./utils/dbConnect");

//models
require("./models/index");

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("src/public"));

//routes
app.use(routes);
app.use(errorMiddleware);
require("./utils/jobs/appointmentReminders");

(async () => {
  try {
    await dbConnection.sync({ force: false });
    const PORT = process.env.PORT || 4001;
    app.listen(PORT, () => {
      console.log(`Server is running at ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
})();
