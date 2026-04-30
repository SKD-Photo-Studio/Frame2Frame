const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Ensure API key is present
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
if (!apiKey) {
  console.error("❌ ERROR: GEMINI_API_KEY is missing in .env.local");
  process.exit(1);
}

const ai = new GoogleGenAI(apiKey);

async function runReview() {
  console.log("🔍 Reviewer (Tier 1: Flash) is auditing the code...");
  
  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Read the plan and the current code diff (simulated here)
    const plan = fs.readFileSync(path.resolve(__dirname, '../../docs/ARCHITECT_PLAN.md'), 'utf8');
    
    const systemPrompt = `You are the Frame2Frame Quality Controller.
Your goal is to review a Pull Request against the provided ARCHITECT_PLAN.md.
PLAN:
${plan}

Task: Compare the code changes in the PR against this plan. 
- Does the code follow the blueprint?
- Are there any security violations (Auth/Financials)?
- Is the code Edge-optimized?
Output: A concise 'PASS' or 'FAIL' with a list of required fixes.`;

    // In a real scenario, we would pipe the git diff here.
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    console.log("\n--- REVIEW REPORT ---");
    console.log(response.text());
    console.log("----------------------");
    
  } catch (error) {
    console.error("❌ Error running Reviewer:", error);
  }
}

runReview();
