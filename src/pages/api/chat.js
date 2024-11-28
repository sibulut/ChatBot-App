// pages/api/chat.js

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Set CORS headers to allow requests from any origin
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    // Preflight request, just send a 200 response
    return res.status(200).end();
  }

  if (req.method === "POST") {
    const { user_query } = req.body;

    // Validate the incoming user query
    if (!user_query || !Array.isArray(user_query)) {
      return res.status(400).json({ error: "Invalid user query provided" });
    }

    try {
      // OpenAI Chat Completion API call
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",   // Or "gpt-4o-mini"
        messages: user_query,
        temperature: 0.7,
      });

      // Extract chat response from OpenAI API
      const chatResponse = response.choices[0].message.content;

      // Return the response to the frontend
      return res.status(200).json({ response: chatResponse });
    } catch (error) {
      console.error("Error with OpenAI API:", error);
      return res.status(500).json({ error: "Something went wrong with the OpenAI API" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}