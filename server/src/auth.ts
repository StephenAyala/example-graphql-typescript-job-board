import { Request, Response } from "express";
import { expressjwt } from "express-jwt";
import jwt from "jsonwebtoken";
import { getUserByEmail } from "./db/users.js";

// The secret used to sign and verify JWT tokens, encoded in base64.
const secret = Buffer.from("Zn8Q5tyZ/G1MHltc4F/gTkVJMlrbKiZt", "base64");

/**
 * Middleware for authenticating JWT tokens in Express applications.
 * It uses the 'express-jwt' library to validate the JWTs found in the Authorization header.
 *
 * The middleware:
 * - Checks for JWTs using the HS256 algorithm.
 * - Does not require credentials to be included in requests.
 * - Uses the predefined secret key for validating the JWTs.
 */
export const authMiddleware = expressjwt({
  algorithms: ["HS256"], // Algorithm used to sign the token.
  credentialsRequired: false, // Determines if credentials are required.
  secret, // Secret key used to validate the JWT.
});

/**
 * Asynchronous function to handle user login requests.
 *
 * @param {Request} req - The incoming request object from Express.
 * @param {Response} res - The outgoing response object from Express.
 */
export async function handleLogin(req: Request, res: Response) {
  const { email, password } = req.body; // Extract email and password from request body.
  const user = await getUserByEmail(email); // Retrieve the user with the given email.

  // If no user is found or the password does not match, send a 401 Unauthorized response.
  if (!user || user.password !== password) {
    res.sendStatus(401);
  } else {
    // If the user is authenticated, create JWT claims and sign the token.
    const claims = { sub: user.id, email: user.email }; // Define JWT claims.
    const token = jwt.sign(claims, secret); // Sign the token with the secret.

    // Send the signed JWT token in the response.
    res.json({ token });
  }
}
