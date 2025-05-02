// controllers/incomingCallController.js
const twilio = require("twilio");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Setting } = require("../models");

const { twiml } = twilio;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY environment variable");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

let SETTINGS_CACHE = null;

async function loadSettings() {
  if (SETTINGS_CACHE) return SETTINGS_CACHE;
  try {
    const setting = await Setting.findOne({
      where: { id: 1 },
      raw: true,
    });

    if (!setting) {
      console.error("No settings found in the database");
      return {};
    }

    SETTINGS_CACHE = setting;
    return SETTINGS_CACHE;
  } catch (error) {
    console.error("Error fetching settings:", error.stack || error);
    return {};
  }
}

async function getAIResponse(prompt) {
        console.log("User input:", prompt);

  const settings = await loadSettings();
  const SYSTEM_MESSAGE =
    settings.system_message || "You are a helpful assistant.";

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: `${SYSTEM_MESSAGE}\n\nUser: ${prompt}` }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 100,
      },
    });

    const response = result.response.text();
    console.log("AI Response:", response);
    return response;
  } catch (error) {
    console.error("Gemini Error:", error.stack || error);
    return "Sorry, I didn't catch that. Please try again.";
  }
}

module.exports = async (request, reply) => {
  try {
    const settings = await loadSettings();
    const VOICE = settings.voice || "alloy";
    const WELCOME_MESSAGE = settings.welcome_message;
    const userInput = request.body?.SpeechResult || "";
    const response = new twiml.VoiceResponse();

    if (userInput) {
      const aiResponse = await getAIResponse(userInput);
      response.say({ voice: VOICE }, aiResponse);
    } else {
      response.say({ voice: VOICE }, WELCOME_MESSAGE);
    }

    response.gather({
      input: "speech",
      action: "/incoming-call",
      method: "POST",
      speechTimeout: "auto",
      speechModel: "experimental_conversations", // Try this for better recognition
      //hints: "help, question, time, weather",
      language: "en-US", // Explicitly set language
      enhanced: true, // Enable enhanced speech recognition
    });

    reply
      .header("Content-Type", "text/xml")
      .type("text/xml")
      .send(response.toString());
  } catch (err) {
    console.error("Call Error:", err);
    const response = new twiml.VoiceResponse();
    const settings = await loadSettings();
    const VOICE = settings?.voice || "alloy";
    response.say({ voice: VOICE }, "One moment please...");
    reply.type("text/xml").send(response.toString());
  }
};
