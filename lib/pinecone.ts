import { Pinecone } from "@pinecone-database/pinecone";

const pineconeClient = new Pinecone({
  apiKey: "pinecone-api-key",
});

export default pineconeClient;
