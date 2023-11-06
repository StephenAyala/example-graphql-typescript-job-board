// Import the `customAlphabet` function from the `nanoid` library,
// which is a tiny, secure, URL-friendly, unique string ID generator.
import { customAlphabet } from "nanoid";

// Define a custom alphabet set. The IDs generated will consist of
// characters from this set only. This includes numbers 0-9,
// uppercase letters A-Z, and lowercase letters a-z.
const ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

// Export a `generateId` function that produces a unique identifier.
// This function will generate a string of 12 characters long,
// using the defined `ALPHABET`. Each time you call `generateId()`,
// it will return a new string with a high likelihood of uniqueness.
export const generateId = customAlphabet(ALPHABET, 12);
