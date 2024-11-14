import express from "express";
import { passport } from "../middleware/spotifyAuth";

const router = express.Router();

// Route pour lancer l'authentification avec Spotify
router.get(
  "/spotify",
  passport.authenticate("spotify", {
    scope: ["user-read-private", "playlist-modify-public"],
  })
);

// Route de callback pour l'authentification avec Spotify
router.get(
  "/spotify/callback",
  passport.authenticate("spotify", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/"); // Redirige vers la page d'accueil après connexion
  }
);

// Route pour vérifier l'état d'authentification
router.get("/status", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ authenticated: true, user: req.user });
  } else {
    res.json({ authenticated: false });
  }
});

export default router;
