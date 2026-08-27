import { execSync } from "child_process";
import fs from "fs";

const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAhZ4FcJwneXF-oiQY0VV2UdMZCFWsOEL4";
const MODEL_NAME = "gemini-3.6-flash";

async function runLoop() {
  console.log(`\n=================================================`);
  console.log(` ZORAKO DIRECT GEMINI 2.5 PRO REFACTOR AGENT `);
  console.log(`=================================================\n`);
  
  let testOutput = "";
  try {
    testOutput = execSync("node engine/index.js", { encoding: "utf-8" });
    console.log("[CURRENT SIMULATION OUTPUT]:\n" + testOutput);
  } catch (err) {
    testOutput = err.stdout || err.stderr || err.message;
    console.log("[CURRENT SIMULATION ERROR]:\n" + testOutput);
  }

  const code = fs.readFileSync("engine/zorako-engine.js", "utf-8");

  const prompt = `
  You are an expert TCAD Semiconductor Physicist.
  Fix the physics numerical explosion bugs in engine/zorako-engine.js.
  
  Current test output of 'node engine/index.js':
  ${testOutput}

  Current code of engine/zorako-engine.js:
  ${code}

  Instructions:
  1. Refactor zorako-engine.js using normalized potential u = psi / Vt and Scharfetter-Gummel discretization.
  2. Clamp potential updates so that at 0.0V bias, Net Transport is 0.0 mA/cm², and finite under forward bias.
  3. Return ONLY valid code inside a standard \`\`\`javascript code block.
  `;

  console.log(`\n[AGENT] Requesting refactor from ${MODEL_NAME}...`);
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    console.error("[AGENT ERROR Response]:", JSON.stringify(data, null, 2));
    return;
  }

  const match = text.match(/```javascript([\s\S]*?)```/);
  if (match) {
    fs.writeFileSync("engine/zorako-engine.js", match[1].trim());
    console.log("[SUCCESS] Updated engine/zorako-engine.js with Gemini 2.5 Pro refactor.");
    console.log("\n=================================================");
    console.log(" NEW TEST RESULT:");
    console.log("=================================================");
    console.log(execSync("node engine/index.js", { encoding: "utf-8" }));
  } else {
    console.log("[AGENT ERROR] Could not parse JavaScript block from response.");
  }
}

runLoop();
