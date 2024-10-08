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
app.use("/", express.static(path.join(__dirname, "uploads")));

// app.use(express.static());

app.use("/", require("./routes/root"));

app.use("/api/auth", require("./routes/adminsAuthRoutes"));
app.use("/api/admins", require("./routes/adminRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/fav", require("./routes/favUnitsRoutes"));
app.use("/api/projects", require("./routes/projectsRoutes"));
app.use("/api/properties", require("./routes/propertiesRoutes"));
app.use("/api/amenities", require("./routes/amenitiesRoutes"));
app.use("/api/views", require("./routes/viewsRoutes"));
app.use("/api/installments", require("./routes/installmentsRoutes"));
app.use("/api/categories", require("./routes/categoriesRoutes"));
app.use("/api/types", require("./routes/typesRoutes"));
app.use("/api/articles", require("./routes/articlesRoutes"));
app.use("/api/agents", require("./routes/agentsRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

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
