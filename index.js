import dotenv from "dotenv";
import fastify from "fastify";
import fastifyFormBody from "@fastify/formbody";
import { GoogleGenerativeAI } from "@google/generative-ai";
import twilio from "twilio";
const { twiml } = twilio;

// Load environment variables
dotenv.config();
const { GEMINI_API_KEY } = process.env;

if (!GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY environment variable");
  process.exit(1);
}

const VOICE = "alloy";
const PORT = process.env.PORT || 5050;
const SYSTEM_MESSAGE = `You are a professional and polite call center agent working for MedRight, a leading medical insurance company in Egypt. 
You assist customers by answering questions clearly and accurately regarding their insurance policies, claims, coverage, hospitals, and procedures. 
Always use a friendly, respectful, and formal tone. 
Provide answers that are accurate, concise, and easy to understand. 
If you are unsure, politely inform the user that you will escalate the query to a human agent. 
Always address the customer professionally, and thank them for contacting MedRight.`;

const app = fastify();
app.register(fastifyFormBody);

// Initialize Gemini with correct model name
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" }); // Updated model name

// Enhanced logging
app.addHook("onRequest", (request, reply, done) => {
  console.log(
    `\n[${new Date().toISOString()}] ${request.method} ${request.url}`
  );
  done();
});

// Gemini Response Generator
async function getAIResponse(prompt) {
  try {
    console.log("User input:", prompt);

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: `${SYSTEM_MESSAGE}\n\nUser: ${prompt}` }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 100, // Limit response length for voice
      },
    });

    const response = result.response.text();
    console.log("AI Response:", response);
    return response;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I didn't catch that. Please try again.";
  }
}

// Call Handler
app.post("/incoming-call", async (request, reply) => {
  try {
    const userInput = request.body.SpeechResult;
    const response = new twiml.VoiceResponse();

    if (userInput) {
      const aiResponse = await getAIResponse(userInput);
      response.say({ voice: VOICE }, aiResponse);
    } else {
response.say(
  { voice: VOICE },
  "Welcome to MedRight, your trusted medical insurance provider in Egypt. This is your virtual assistant. How may I assist you today?"
);
    }

    response.gather({
      input: "speech",
      action: "/incoming-call",
      method: "POST",
      speechTimeout: "auto",
      hints: "help, question, time, weather",
    });

    reply.type("text/xml").send(response.toString());
  } catch (error) {
    console.error("Call Error:", error);
    const response = new twiml.VoiceResponse();
    response.say({ voice: VOICE }, "One moment please...");
    reply.type("text/xml").send(response.toString());
  }
});

// Start Server
app.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
  if (err) throw err;
  console.log(`🚀 Server ready at ${address}`);
  console.log(`Twilio webhook: ${address}/incoming-call`);
});
