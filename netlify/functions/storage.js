const { connectLambda, getStore } = require("@netlify/blobs");

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Cache-Control": "no-cache, no-store, must-revalidate", // Prevents browser/CDN caching
  "Pragma": "no-cache",
  "Expires": "0"
};

exports.handler = async (event) => {
  // Handle CORS preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }

  // Blobs needs the Lambda-style event to pick up its credentials
  connectLambda(event);

  // Initialize the specific blob store for our shipments
  const store = getStore("gwh-planner-store");
  
  try {
      // GET request: Load the shipments from Blob
      if (event.httpMethod === "GET") {
        const data = await store.get("shipments", { type: "json" });
        return { 
            statusCode: 200, 
            headers,
            body: JSON.stringify(data || []) 
        };
      }
      
      // POST request: Save the shipments to Blob
      if (event.httpMethod === "POST") {
        const body = JSON.parse(event.body);
        await store.setJSON("shipments", body);
        return { 
            statusCode: 200, 
            headers,
            body: JSON.stringify({ success: true }) 
        };
      }
      
      return { statusCode: 405, headers, body: "Method Not Allowed" };
  } catch (error) {
      console.error("Blob Storage Error:", error);
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Internal Server Error" }) };
  }
};