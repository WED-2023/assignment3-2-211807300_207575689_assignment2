require("dotenv").config();
const express = require("express");
const path = require("path");
const logger = require("morgan");
const session = require("client-sessions");
const cors = require("cors");
const DButils = require("./routes/utils/DButils");

const app = express();
const port = process.env.PORT || 3000;

console.log("Loaded env:", {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
});

// Middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "dist"))); // adjust for deployment

// Session setup
app.use(
  session({
    cookieName: "session",
    secret: process.env.COOKIE_SECRET || "template",
    duration: 24 * 60 * 60 * 1000,
    activeDuration: 1000 * 60 * 5,
    cookie: { httpOnly: false },
  })
);

// CORS setup
app.use(
  cors({
    origin: ["http://localhost:8080", "http://localhost:8081"], // Vue dev server origin
    credentials: true,
  })
);

// Serve index
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/index.html"));
});

// Auth middleware (session checker)
app.use((req, res, next) => {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM users")
      .then((users) => {
        if (users.find((x) => x.user_id === req.session.user_id)) {
          req.user_id = req.session.user_id;
        }
        next();
      })
      .catch(() => next());
  } else {
    next();
  }
});

// Health check
app.get("/alive", (req, res) => res.send("I'm alive"));

// Routes
app.use("/users", require("./routes/user"));
app.use("/recipes", require("./routes/recipes"));
app.use("/", require("./routes/auth"));

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).send({ message: err.message, success: false });
});

// Start server
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

process.on("SIGINT", () => {
  if (server) {
    server.close(() => console.log("Server closed"));
  }
  process.exit();
});