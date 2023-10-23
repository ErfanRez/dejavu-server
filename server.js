require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();
const path = require("path");
const { logger } = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const PORT = process.env.PORT || 3500;

console.log(process.env.NODE_ENV);

app.use(logger);

app.use(cors(corsOptions));

app.use(express.json());

app.use(cookieParser());

app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.use("/", express.static(path.join(__dirname, "public")));
app.use("/", express.static(path.join(__dirname, "images")));

// app.use(express.static());

app.use("/", require("./routes/root"));

// app.use("/auth", require("./routes/authRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/fav", require("./routes/favUnitsRoutes"));
app.use("/properties", require("./routes/propertiesRoutes"));
app.use("/units", require("./routes/unitsRoutes"));
app.use("/amenities", require("./routes/amenitiesRoutes"));
app.use("/installments", require("./routes/installmentsRoutes"));
app.use("/categories", require("./routes/categoriesRoutes"));
app.use("/types", require("./routes/typesRoutes"));
app.use("/articles", require("./routes/articlesRoutes"));
app.use("/agents", require("./routes/agentsRoutes"));

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
