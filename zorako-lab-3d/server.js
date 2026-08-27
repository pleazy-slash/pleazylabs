import http from "http";
import { mergeElements } from "./lib/materialCombiner.js";
import { simulateMultiYearAging } from "./lib/multiYearAgingEngine.js";
import { calculateIVCurve, calculateOpticalAbsorption } from "./lib/solarPhysicsEngine.js";

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "POST" && req.url === "/api/zorako/studio") {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", () => {
      try {
        const parsed = JSON.parse(body || "{}");
        if (parsed.action === "MERGE_ELEMENTS") {
          return res.end(JSON.stringify({ success: true, result: mergeElements(parsed.elementA, parsed.elementB, parsed.ambientTempC) }));
        }
        if (parsed.action === "CALCULATE_IV_CURVE") {
          return res.end(JSON.stringify({ success: true, ivData: calculateIVCurve(parsed) }));
        }
        if (parsed.action === "OPTICAL_ABSORPTION") {
          return res.end(JSON.stringify({ success: true, absorption: calculateOpticalAbsorption(parsed.thicknessMicrons) }));
        }
        return res.end(JSON.stringify({ success: false, error: "Invalid Action" }));
      } catch (err) {
        return res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
  } else {
    res.end(JSON.stringify({ error: "Not Found" }));
  }
});

server.listen(3006, () => console.log("Zorako Physics Server Ready on Port 3006"));