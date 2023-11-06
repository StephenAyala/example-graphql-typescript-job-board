// Import the DataLoader library, which will be used to batch and cache database lookups.
import DataLoader from "dataloader";

// Import the database connection object from the 'connection.js' file. This object is
// configured to connect to the database using the knex library.
import { connection } from "./connection.js";

// Import the CompanyEntity type definition from the 'types.js' file. This type defines
// the structure and expected types for a company record in the database.
import { CompanyEntity } from "./types.js";

// A helper function that creates a knex query builder instance for the 'company' table.
// This allows us to perform operations on the 'company' table in the database.
const getCompanyTable = () => connection.table<CompanyEntity>("company");

/**
 * Retrieves a company from the database by its unique identifier.
 *
 * @param {string} id - The unique identifier of the company to retrieve.
 * @returns {Promise<CompanyEntity | undefined>} A promise that resolves to the company if found, or undefined if not.
 */
export async function getCompany(id: string) {
  // Use the knex query builder to select the first company record where the id field matches the provided id.
  // The `first()` method ensures that only one record is returned. If no company is found, undefined is returned.
  return await getCompanyTable().first().where({ id });
}

/**
 * Creates a new DataLoader instance for batch loading companies. DataLoader optimizes
 * the loading of resources by batching multiple requests into a single database query.
 *
 * @returns {DataLoader<string, CompanyEntity | undefined>} A DataLoader instance configured to load companies by their IDs.
 */
export function createCompanyLoader() {
  // Instantiate a DataLoader, providing a batch loading function.
  // The batch loading function receives an array of company IDs and returns a Promise
  // that resolves to an array of corresponding companies or undefined if not found.
  return new DataLoader(async (ids: string[]) => {
    // Perform a database query to retrieve all companies whose IDs are in the provided list.
    // The `select()` method retrieves the specified columns, defaulting to all columns if not specified.
    // The `whereIn` clause specifies the IDs to search for, resulting in a single database query.
    const companies = await getCompanyTable().select().whereIn("id", ids);

    // Map the requested IDs to the resulting companies. The ordering of IDs is preserved,
    // as DataLoader expects each index of the return array to correspond to the same index in the original key array.
    // If a company is not found for an ID, undefined is placed at the corresponding index.
    return ids.map((id) => companies.find((company) => company.id === id));
  });
}
