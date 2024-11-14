import express, { Application } from "express";
import session from "express-session";
import dotenv from "dotenv";
import { passport } from "./middleware/spotifyAuth";
import authRoutes from "./routes/auth";
import { connectToDatabase } from "./db/database";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret_key", // Utilise une clé par défaut si SESSION_SECRET est manquant
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("API is running");
});

// Connect to the database and start the server
connectToDatabase()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => console.error("Failed to connect to MongoDB", error));
