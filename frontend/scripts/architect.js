const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Ensure API key is present
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
if (!apiKey) {
  console.error("❌ ERROR: GEMINI_API_KEY is missing in .env.local");
  console.error("Please add it to continue using the Architect.");
  process.exit(1);
}

// Initialize the official Gemini SDK
const ai = new GoogleGenAI(apiKey);

async function runArchitect(userPrompt, isFlash = false) {
  const modelName = isFlash ? "gemini-1.5-flash" : "gemini-1.5-pro";
  const tierName = isFlash ? "Tier 1: Flash (Minor)" : "Tier 2: Pro-Low (Major)";
  
  console.log(`🧠 Architect (${tierName}) is blueprinting...`);
  
  try {
    const model = ai.getGenerativeModel({ model: modelName });
    
    const systemPrompt = `You are the Frame2Frame CTO Architect. 
Your goal is to create a DETAILED technical implementation plan for an AI 'Builder' agent (Jules).
RULES:
1. Output in Markdown.
2. Be extremely specific about file paths and code changes.
3. SECURITY: Do NOT instruct the builder to touch Auth middleware, session logic, or sensitive API keys. Mark those as [SECURITY: IT-HEAD-ONLY].
4. PERFORMANCE: Always prioritize Edge-ready functions and Supabase optimization.`;

    const result = await model.generateContent(systemPrompt + "\n\nRequest: " + userPrompt);
    const response = await result.response;
    const planText = response.text();
    
    const outputPath = path.resolve(__dirname, '../../docs/ARCHITECT_PLAN.md');
    
    // Write the output to the docs/ folder
    fs.writeFileSync(outputPath, planText);
    
    console.log(`✅ Architect finished using ${modelName}.`);
    console.log(`📄 Blueprint saved to: docs/ARCHITECT_PLAN.md`);
    
  } catch (error) {
    console.error("❌ Error running Architect:", error);
  }
}

// Check for --flash flag
const args = process.argv.slice(2);
const isFlash = args.includes('--flash');
const prompt = args.filter(arg => arg !== '--flash').join(' ');

if (!prompt) {
  console.error("Please provide a prompt. \nExample (Major): node architect.js 'Design the RBAC system'\nExample (Minor): node architect.js --flash 'Fix the header alignment'");
  process.exit(1);
}

runArchitect(prompt, isFlash);
