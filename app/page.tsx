"use client";
import pineconeClient from "@/lib/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import OpenAI from "openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { useState } from "react";
import { load } from "langchain/load";

const apiKey = "API_KEY";

export default function Home() {
  const [query, setQeury] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [namespace, setNamespace] = useState("quill");
  const [desc, setDesc] = useState("");

  const handleClicked = async () => {
    try {
      setLoading(true);
      await pineconeClient.getConfig();

      console.log("pineconeClient", pineconeClient);
      //const index = pc.index('products');
      const pineconeIndex = pineconeClient.index("quill");

      pineconeClient.createIndex({
        name: "quill",
        dimension: 1536,
        metric: "cosine",
        spec: {
          pod: {
            environment: "gcp-starter",
            pods: 1,
            podType: "starter",
          },
        },
      });
      console.log("desc", desc);
      const embeddings = new OpenAIEmbeddings({
        openAIApiKey: "ApiKey",
      });

      await PineconeStore.fromTexts([desc], {}, embeddings, {
        pineconeIndex,
        namespace: namespace,
      });

      console.log("Index created");
      setLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  const handleQuery = async () => {
    console.log("namespace", namespace);
    try {
      const embeddings = new OpenAIEmbeddings({
        openAIApiKey: "ApiKey",
      });
      await pineconeClient.getConfig();
      const pineconeIndex = pineconeClient.index("quill");

      const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
        namespace: namespace,
      });

      const results = await vectorStore.similaritySearch(query, 2);
      console.log("Results", results);
      const response = await new OpenAI({
        apiKey: "ApiKey",
        dangerouslyAllowBrowser: true,
      }).chat.completions.create({
        model: "gpt-3.5-turbo",
        temperature: 0,

        messages: [
          {
            role: "system",
            content:
              "Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.",
          },
          {
            role: "user",
            content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
            
      
      \n----------------\n
      
      CONTEXT:
      ${results.map((r) => r.pageContent).join("\n\n")}
      
      USER INPUT: ${query}`,
          },
        ],
      });

      console.log("Response", response.choices[0].message.content!);
      //setResponse(response.choices[0].message.content!);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <main className="flex flex-col items-center ">
      <h1 className="text-2xl font-bold mt-2">Pinecone</h1>

      <input
        className="w-11/12 mt-3 mb-3 p-4 border-2 border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-500 mx-12"
        type="text"
        placeholder="give a namespace"
        onChange={(e) => setNamespace(e.target.value!)}
      />
      <textarea
        className="w-11/12 mt-3 h-96 p-4 border-2 border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-500 mx-12"
        name="paragraph"
        id=""
        cols={30}
        rows={10}
        placeholder="Enter text here"
        onChange={(e) => setDesc(e.target.value!)}
      ></textarea>

      <button
        onClick={handleClicked}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg focus:outline-none"
      >
        Index
      </button>

      {!loading && (
        <>
          <input
            onChange={(e) => setQeury(e.target.value)}
            type="text"
            className="w-11/12 mt-3 mb-3 p-4 border-2 border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-500 mx-12"
            placeholder="Enter text here"
          />

          <button
            onClick={handleQuery}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg focus:outline-none"
          >
            Query
          </button>
        </>
      )}
      {response && (
        <div className="w-11/12 mt-3 p-4 border-2 border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-500 mx-12">
          {response}
        </div>
      )}
    </main>
  );
}
