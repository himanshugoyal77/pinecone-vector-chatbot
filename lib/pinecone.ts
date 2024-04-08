import { Pinecone } from "@pinecone-database/pinecone";

const pineconeClient = new Pinecone({
  apiKey: "api_key",
  //"f0574308-c64b-489b-bee3-79e29eb193b7",
});

export default pineconeClient;
