// Import the connection object from the connection.js file. This object provides
// the configured database connection using knex.
import { connection } from "./connection.js";

// Import the UserEntity type definition from the types.js file. This type defines
// the structure and types for a user record in the database.
import { UserEntity } from "./types.js";

// A helper function that returns the knex query builder for the 'user' table.
// This function is used to access the 'user' table and perform database operations.
const getUserTable = () => connection.table<UserEntity>("user");

/**
 * Retrieves a user from the database by their unique identifier.
 *
 * @param {string} id - The unique identifier of the user to retrieve.
 * @returns {Promise<UserEntity | undefined>} A promise that resolves to the user if found, or undefined if not.
 */
export async function getUser(id: string) {
  // Use the knex query builder to select the first user record where the id field matches the provided id.
  // If the user is found, it is returned; otherwise, undefined is returned.
  return await getUserTable().first().where({ id });
}

/**
 * Retrieves a user from the database by their email address.
 *
 * @param {string} email - The email address of the user to retrieve.
 * @returns {Promise<UserEntity | undefined>} A promise that resolves to the user if found, or undefined if not.
 */
export async function getUserByEmail(email: string) {
  // Use the knex query builder to select the first user record where the email field matches the provided email.
  // If the user is found, it is returned; otherwise, undefined is returned.
  return await getUserTable().first().where({ email });
}
