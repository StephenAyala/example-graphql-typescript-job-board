import { useMutation, useQuery } from "@apollo/client";
import {
  companyByIdQuery,
  createJobMutation,
  jobByIdQuery,
  jobsQuery,
} from "./queries";

/**
 * Custom hook to fetch a company by its ID.
 *
 * @param {string} id - The ID of the company to fetch.
 * @returns An object containing the company data, loading state, and error state.
 */
export function useCompany(id: string) {
  const { data, loading, error } = useQuery(companyByIdQuery, {
    variables: { id },
  });

  // Returns the company object, loading state, and a boolean representing if there was an error.
  return { company: data?.company, loading, error: Boolean(error) };
}

/**
 * Custom hook to fetch a job by its ID.
 *
 * @param {string} id - The ID of the job to fetch.
 * @returns An object containing the job data, loading state, and error state.
 */
export function useJob(id: string) {
  const { data, loading, error } = useQuery(jobByIdQuery, {
    variables: { id },
  });

  // Returns the job object, loading state, and a boolean representing if there was an error.
  return { job: data?.job, loading, error: Boolean(error) };
}

/**
 * Custom hook to fetch a list of jobs with pagination support.
 *
 * @param {number} [limit] - The number of jobs to fetch.
 * @param {number} [offset] - The offset from where to start fetching jobs.
 * @returns An object containing the jobs data, loading state, and error state.
 */
export function useJobs(limit?: number, offset?: number) {
  const { data, loading, error } = useQuery(jobsQuery, {
    variables: { limit, offset },
    fetchPolicy: "network-only", // Ignores the cache and always fetches from the network.
  });

  // Returns the jobs array, loading state, and a boolean representing if there was an error.
  return { jobs: data?.jobs, loading, error: Boolean(error) };
}

/**
 * Custom hook for creating a new job.
 *
 * @returns An object containing the createJob function and the loading state.
 */
export function useCreateJob() {
  const [mutate, { loading }] = useMutation(createJobMutation);

  /**
   * Function to create a new job by invoking the GraphQL mutation.
   *
   * @param {string} title - The title of the new job.
   * @param {string} [description] - The description of the new job (optional).
   * @returns The newly created job data.
   */
  const createJob = async (title: string, description?: string) => {
    const {
      data: { job },
    } = await mutate({
      variables: { input: { title, description } },
      update: (cache, { data }) => {
        // Updates the Apollo cache with the new job data.
        cache.writeQuery({
          query: jobByIdQuery,
          variables: { id: data.job.id },
          data,
        });
      },
    });

    return job;
  };

  // Returns the createJob function and the loading state.
  return {
    createJob,
    loading,
  };
}
