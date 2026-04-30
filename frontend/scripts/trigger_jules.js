const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const JULES_API_KEY = process.env.JULES_API_KEY;
if (!JULES_API_KEY) {
  console.error("❌ ERROR: JULES_API_KEY is missing in .env.local");
  console.error("Get it from https://jules.google.com/settings#api");
  process.exit(1);
}

const TARGET_REPO = "Ashwyn-Mangalampalli/SKD-Frame2Frame";
const BASE_URL = "https://jules.googleapis.com/v1alpha";

async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, options);
    if (res.ok) return res;
    if (res.status >= 500) {
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
      continue;
    }
    const errorText = await res.text();
    throw new Error(`API Error ${res.status}: ${errorText}`);
  }
  throw new Error("Max retries reached.");
}

async function getSource() {
  console.log("🔍 Locating GitHub repository in Jules...");
  const res = await fetchWithRetry(`${BASE_URL}/sources`, {
    headers: { 'X-Goog-Api-Key': JULES_API_KEY }
  });
  const data = await res.json();
  const source = data.sources?.find(s => 
    s.githubRepo?.owner === TARGET_REPO.split('/')[0] && 
    s.githubRepo?.repo === TARGET_REPO.split('/')[1]
  );
  
  if (!source) {
    throw new Error(`Could not find repository ${TARGET_REPO} in Jules connected sources.`);
  }
  return source.name; // e.g., "sources/github/owner/repo"
}

async function triggerJules(sourceName, planText) {
  console.log("🚀 Transmitting ARCHITECT_PLAN to Jules...");
  
  const payload = {
    prompt: `Please implement the following architectural blueprint:\n\n${planText}`,
    sourceContext: {
      source: sourceName,
      githubRepoContext: { startingBranch: "main" }
    },
    automationMode: "AUTO_CREATE_PR",
    title: "Automated Blueprint Implementation"
  };

  const res = await fetchWithRetry(`${BASE_URL}/sessions`, {
    method: 'POST',
    headers: {
      'X-Goog-Api-Key': JULES_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  const session = await res.json();
  console.log(`✅ Session Created: ${session.name}`);
  return session.name;
}

async function pollSession(sessionName) {
  console.log("📡 Monitoring Jules progress... (Polling every 15s)");
  
  let isComplete = false;
  let lastActivityId = null;

  while (!isComplete) {
    await new Promise(resolve => setTimeout(resolve, 15000)); // 15 second polling
    
    const res = await fetchWithRetry(`${BASE_URL}/${sessionName}/activities?pageSize=10`, {
      headers: { 'X-Goog-Api-Key': JULES_API_KEY }
    });
    
    const data = await res.json();
    const activities = data.activities || [];
    
    if (activities.length > 0 && activities[0].id !== lastActivityId) {
      lastActivityId = activities[0].id;
      const latest = activities[0];
      
      if (latest.progressUpdated) {
        console.log(`⏳ Jules update: ${latest.progressUpdated.title}`);
      } else if (latest.sessionCompleted) {
        console.log("🎉 Jules has completed the session!");
        isComplete = true;
        
        // Extract PR URL if available
        if (latest.artifacts) {
          latest.artifacts.forEach(artifact => {
            if (artifact.changeSet?.pullRequest?.url) {
              console.log(`🔗 Pull Request URL: ${artifact.changeSet.pullRequest.url}`);
            }
          });
        }
      } else if (latest.planGenerated) {
         console.log(`📋 Jules generated internal plan with ${latest.planGenerated.plan?.steps?.length || 0} steps.`);
      }
    }
  }
}

async function run() {
  try {
    const planPath = path.resolve(__dirname, '../../docs/ARCHITECT_PLAN.md');
    if (!fs.existsSync(planPath)) {
       throw new Error(`ARCHITECT_PLAN.md not found at ${planPath}`);
    }
    const planText = fs.readFileSync(planPath, 'utf8');

    const sourceName = await getSource();
    const sessionName = await triggerJules(sourceName, planText);
    await pollSession(sessionName);
    
    console.log("➡️  Next Step: Run 'npm run review' to audit Jules's PR.");
  } catch (error) {
    console.error("❌ Script Failed:", error.message);
  }
}

run();
