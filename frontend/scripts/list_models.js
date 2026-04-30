const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ path: '../.env.local' });

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });

async function listModels() {
  try {
    const models = await ai.models.list();
    console.log("Available models:");
    for await (const model of models) {
        if(model.name.includes("pro") || model.name.includes("flash")) {
            console.log(model.name);
        }
    }
  } catch(e) {
      console.error(e);
  }
}

listModels();
