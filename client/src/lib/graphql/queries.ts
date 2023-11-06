// Apollo Client-related imports for creating and configuring the client.
import {
  ApolloClient,
  ApolloLink,
  concat,
  createHttpLink,
  gql,
  InMemoryCache,
} from "@apollo/client";
// A custom function likely used to retrieve an access token for authentication.
import { getAccessToken } from "../auth";

// Setup a link that points the Apollo client to the GraphQL server's endpoint.
const httpLink = createHttpLink({ uri: "http://localhost:9000/graphql" });

// Define an Apollo middleware link that injects the Authorization header with a bearer token into each request.
const authLink = new ApolloLink((operation, forward) => {
  // Retrieve the access token using a custom function.
  const accessToken = getAccessToken();
  // If an access token exists, set the Authorization header.
  if (accessToken) {
    operation.setContext({
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }
  // Forward the operation to the next link in the middleware chain.
  return forward(operation);
});

// Create the Apollo Client instance, combining the auth link and the HTTP link.
// Also, set up the cache for storing the results of queries.
export const apolloClient = new ApolloClient({
  link: concat(authLink, httpLink),
  cache: new InMemoryCache(),
});
// Define a GraphQL fragment for job details to avoid repeating these fields in multiple queries.
const jobDetailFragment = gql`
  fragment JobDetail on Job {
    id
    date
    title
    company {
      id
      name
    }
    description
  }
`;
// GraphQL query to fetch details of a company by its ID, including the jobs it has posted.
export const companyByIdQuery = gql`
  query CompanyById($id: ID!) {
    company(id: $id) {
      id
      name
      description
      jobs {
        id
        date
        title
      }
    }
  }
`;
// GraphQL query to fetch job details by ID, utilizing the JobDetail fragment to define the returned fields.
export const jobByIdQuery = gql`
  query JobById($id: ID!) {
    job(id: $id) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;

// GraphQL query to fetch a list of jobs with pagination support, including the total count of jobs.
export const jobsQuery = gql`
  query Jobs($limit: Int, $offset: Int) {
    jobs(limit: $limit, offset: $offset) {
      items {
        id
        date
        title
        company {
          id
          name
        }
      }
      totalCount
    }
  }
`;
// GraphQL mutation to create a new job with specified details, using the JobDetail fragment to get the new job's details.
export const createJobMutation = gql`
  mutation CreateJob($input: CreateJobInput!) {
    job: createJob(input: $input) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;
