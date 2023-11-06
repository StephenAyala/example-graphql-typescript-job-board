// Import the GraphQLError class to handle GraphQL-specific errors
import { GraphQLError } from "graphql";

// Import database operation functions for companies and jobs
import { getCompany } from "./db/companies.js";
import {
  countJobs,
  createJob,
  deleteJob,
  getJob,
  getJobs,
  getJobsByCompany,
  updateJob,
} from "./db/jobs.js";

/**
 * Defines GraphQL resolvers for the Apollo Server.
 */
export const resolvers = {
  // Resolvers for Query types
  Query: {
    // Resolver for fetching a company by ID
    company: async (_root, { id }) => {
      const company = await getCompany(id);
      if (!company) {
        throw notFoundError("No Company found with id " + id);
      }
      return company;
    },
    // Resolver for fetching a job by ID
    job: async (_root, { id }) => {
      const job = await getJob(id);
      if (!job) {
        throw notFoundError("No Job found with id " + id);
      }
      return job;
    },
    // Resolver for fetching a list of jobs with pagination
    jobs: async (_root, { limit, offset }) => {
      const items = await getJobs(limit, offset);
      const totalCount = await countJobs();
      return { items, totalCount };
    },
  },

  // Resolvers for Mutation types
  Mutation: {
    // Resolver to create a new job
    createJob: (_root, { input: { title, description } }, { user }) => {
      if (!user) {
        throw unauthorizedError("Missing authentication");
      }
      return createJob({ companyId: user.companyId, title, description });
    },

    // Resolver to delete a job
    deleteJob: async (_root, { id }, { user }) => {
      if (!user) {
        throw unauthorizedError("Missing authentication");
      }
      const job = await deleteJob(id, user.companyId);
      if (!job) {
        throw notFoundError("No Job found with id " + id);
      }
      return job;
    },

    // Resolver to update a job
    updateJob: async (
      _root,
      { input: { id, title, description } },
      { user }
    ) => {
      if (!user) {
        throw unauthorizedError("Missing authentication");
      }
      const job = await updateJob({
        id,
        companyId: user.companyId,
        title,
        description,
      });
      if (!job) {
        throw notFoundError("No Job found with id " + id);
      }
      return job;
    },
  },

  // Resolvers related to Company type fields
  Company: {
    // Resolver for fetching jobs associated with a company
    jobs: (company) => getJobsByCompany(company.id),
  },

  // Resolvers related to Job type fields
  Job: {
    // Resolver for fetching a company associated with a job
    company: (job, _args, { companyLoader }) => {
      return companyLoader.load(job.companyId);
    },
    // Resolver for formatting the job creation date in ISO format
    date: (job) => toIsoDate(job.createdAt),
  },
};

/**
 * Creates a GraphQLError with a 'NOT_FOUND' extension code.
 * @param {string} message - The error message to be displayed.
 * @returns {GraphQLError} - The formatted GraphQL error.
 */
function notFoundError(message: string) {
  return new GraphQLError(message, {
    extensions: { code: "NOT_FOUND" },
  });
}

/**
 * Creates a GraphQLError with an 'UNAUTHORIZED' extension code.
 * @param {string} message - The error message to be displayed.
 * @returns {GraphQLError} - The formatted GraphQL error.
 */
function unauthorizedError(message: string) {
  return new GraphQLError(message, {
    extensions: { code: "UNAUTHORIZED" },
  });
}

/**
 * Formats a timestamp into an ISO-8601 date string.
 * @param {string} value - The timestamp to format.
 * @returns {string} - The date in ISO-8601 format.
 */
function toIsoDate(value: string) {
  return value.slice(0, "yyyy-mm-dd".length);
}
