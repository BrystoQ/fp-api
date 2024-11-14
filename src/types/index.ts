// src/types/index.ts
import { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId; // _id est optionnel
  spotifyId: string;
  displayName: string;
  accessToken: string;
  refreshToken: string;
}
