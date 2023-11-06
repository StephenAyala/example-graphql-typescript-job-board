/**
 * Apollo Server Integration with Express.js
 */

// Apollo Server and middleware imports for integration with Express
import { ApolloServer } from "@apollo/server";
import { expressMiddleware as apolloMiddleware } from "@apollo/server/express4";
// CORS middleware to allow or restrict requested resources on a web server
import cors from "cors";
// Express.js for building the server and handling HTTP requests
import express from "express";
// File system module to handle file operations, here used for reading schema file
import { readFile } from "node:fs/promises";
// Importing custom authentication middleware and login handler function
import { authMiddleware, handleLogin } from "./auth.js";
// GraphQL resolvers defining how to fetch the types defined in the schema
import { resolvers } from "./resolvers.js";
// Database loader and accessor for the company data
import { createCompanyLoader } from "./db/companies.js";
// Database accessor to get user data
import { getUser } from "./db/users.js";

// Port number where the server will listen
const PORT = 9000;

// Create an Express application
const app = express();

// Apply middleware for CORS, JSON body parsing, and authentication
app.use(cors(), express.json(), authMiddleware);

// Define a route for handling login with POST requests
app.post("/login", handleLogin);

// Read GraphQL schema definition from a file
const typeDefs = await readFile("./schema.graphql", "utf8");

/**
 * Function to prepare and provide context for each GraphQL request.
 * @param {Object} req - The request object from Express.js
 * @returns context for the Apollo server to pass to resolvers.
 */
async function getContext({ req }) {
  // Create a new DataLoader for company entities to batch requests
  const companyLoader = createCompanyLoader();
  const context: any = { companyLoader };

  // If the request has authentication data, fetch and add the user to the context
  if (req.auth) {
    context.user = await getUser(req.auth.sub);
  }
  return context;
}

// Initialize ApolloServer with type definitions and resolvers
const apolloServer = new ApolloServer({ typeDefs, resolvers });

// Start Apollo Server
await apolloServer.start();

// Apply Apollo middleware to an Express application on the '/graphql' endpoint
app.use("/graphql", apolloMiddleware(apolloServer, { context: getContext }));

// Start the Express server and listen on the specified port
app.listen({ port: PORT }, () => {
  // Log server running status and GraphQL endpoint to the console
  console.log(`Server running on port ${PORT}`);
  console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
});
