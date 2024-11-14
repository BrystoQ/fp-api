import passport from "passport";
import { Strategy as SpotifyStrategy } from "passport-spotify";
import dotenv from "dotenv";
import { connectToDatabase } from "../db/database";
import { User } from "../types";
import { ObjectId } from "mongodb";

dotenv.config();

const clientID = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const callbackURL = process.env.REDIRECT_URI;

if (!clientID || !clientSecret || !callbackURL) {
  throw new Error(
    "Spotify client ID, client secret, or redirect URI is missing from environment variables."
  );
}

passport.use(
  new SpotifyStrategy(
    {
      clientID,
      clientSecret,
      callbackURL,
    },
    async (
      accessToken: string,
      refreshToken: string,
      expires_in: number,
      profile: any,
      done: Function
    ) => {
      try {
        const db = await connectToDatabase();
        const usersCollection = db.collection<User>("users");

        // Recherche de l'utilisateur dans la base de données
        let user = await usersCollection.findOne({ spotifyId: profile.id });

        if (!user) {
          // Si l'utilisateur n'existe pas, crée-le
          const newUser: User = {
            spotifyId: profile.id,
            displayName: profile.displayName || profile.username,
            accessToken,
            refreshToken,
          };
          const result = await usersCollection.insertOne(newUser);
          user = { ...newUser, _id: result.insertedId }; // Ajoute l'ID généré par MongoDB à l'utilisateur
        } else {
          // Met à jour l'utilisateur existant
          await usersCollection.updateOne(
            { spotifyId: profile.id },
            { $set: { accessToken, refreshToken } }
          );
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj: unknown, done) => {
  done(null, obj as User); // Cast explicite pour résoudre l'erreur TypeScript
});

export { passport };
