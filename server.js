require("express-async-errors");
require("dotenv").config();
const express = require("express");
const helmet = require("helmet");

const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const corsOptions = require("./config/corsOptions");
const connectDB = require("./config/dbConn");
const { logger, logEvents } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const PORT = process.env.PORT || 3500;

console.log(process.env.NODE_ENV);

// Security
app.use(helmet());
app.disable("x-powered-by");

connectDB();
app.use(logger);

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use("/", express.static(path.join(__dirname, "public")));

app.use("/", require("./routes/root"));
app.use("/auth", require("./routes/authRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/orders", require("./routes/orderRoutes"));
app.use("/gathers", require("./routes/gatherRoutes"));
app.use("/transacts", require("./routes/transactRoutes"));
app.use("/customers", require("./routes/customerRoutes"));
app.use("/parcels", require("./routes/parcelRoutes"));

app.get("*", function (req, res) {
  res.sendFile(path.resolve(__dirname, "./build/index.html"));
});

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not found");
  }
});

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connect to db");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});
