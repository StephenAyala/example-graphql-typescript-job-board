// Import the connection object from connection.js, which provides the knex instance
// configured for the SQLite3 database.
import { connection } from "./connection.js";

// Import the function to generate a unique ID for new job entries.
import { generateId } from "./ids.js";

// Import the JobEntity type which defines the structure of a job record.
import { JobEntity } from "./types.js";

// A helper function that returns the knex query builder initialized for the 'job' table.
// This allows us to perform queries on the 'job' table.
const getJobTable = () => connection.table<JobEntity>("job");

// Counts the total number of jobs in the database.
export async function countJobs() {
  // Execute a count query and return the first result as the total count of jobs.
  const { count } = await getJobTable().first().count("*", { as: "count" });
  // Return the count as a number.
  return count as number;
}

// Retrieves a list of jobs from the database, with optional limit and offset for pagination.
export async function getJobs(limit: number, offset: number) {
  // Begin a query to select all columns and order by the 'createdAt' field in descending order.
  const query = getJobTable().select().orderBy("createdAt", "desc");
  // Apply a limit if one is provided, to control the number of jobs returned.
  if (limit) {
    query.limit(limit);
  }
  // Apply an offset if one is provided, for paginated queries.
  if (offset) {
    query.offset(offset);
  }
  // Execute the query and return the resulting jobs.
  return await query;
}

// Retrieves all jobs associated with a given company ID.
export async function getJobsByCompany(companyId: string) {
  // Select all jobs where the companyId matches the given ID.
  return await getJobTable().select().where({ companyId });
}

// Retrieves a single job by its ID.
export async function getJob(id: string) {
  // Select the first job where the id matches the given ID.
  return await getJobTable().first().where({ id });
}

// Defines the structure for the options required to create a job.
type CreateJobOptions = Pick<JobEntity, "companyId" | "title" | "description">;

// Creates a new job record in the database.
export async function createJob({
  companyId,
  title,
  description,
}: CreateJobOptions) {
  // Construct a new JobEntity object with a generated ID and the current timestamp.
  const job: JobEntity = {
    id: generateId(),
    companyId,
    title,
    description,
    createdAt: new Date().toISOString(),
  };
  // Insert the new job into the database.
  await getJobTable().insert(job);
  // Return the newly created job object.
  return job;
}

// Deletes a job from the database by ID, but only if it belongs to the specified company.
export async function deleteJob(id: string, companyId: string) {
  // Retrieve the first job that matches the id and companyId.
  const job = await getJobTable().first().where({ id, companyId });
  // If no job is found, return null.
  if (!job) {
    return null;
  }
  // If a job is found, delete it from the database.
  await getJobTable().delete().where({ id });
  // Return the deleted job object.
  return job;
}

// Defines the structure for the options required to update a job.
type UpdateJobOptions = Pick<
  JobEntity,
  "id" | "companyId" | "title" | "description"
>;

// Updates an existing job's title and description, identified by ID and company ID.
export async function updateJob({
  id,
  companyId,
  title,
  description,
}: UpdateJobOptions) {
  // Retrieve the first job that matches the id and companyId.
  const job = await getJobTable().first().where({ id, companyId });
  // If no job is found, return null.
  if (!job) {
    return null;
  }
  // Define the fields to be updated.
  const updatedFields = { title, description };
  // Execute the update on the database.
  await getJobTable().update(updatedFields).where({ id });
  // Return the updated job object, merging the old and new fields.
  return { ...job, ...updatedFields } as JobEntity;
}
