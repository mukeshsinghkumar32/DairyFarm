const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), override: true });
const { parseWithOpenAI, generateOpenAISummary } = require("../services/openaiService");

(async () => {
  console.log("Checking OPENAI_API_KEY from env:");
  const key = process.env.OPENAI_API_KEY || "";
  console.log("Key length:", key.length, "Starts with:", key.substring(0, 10));

  console.log("\nTesting parseWithOpenAI('Murrah buffalo under 90000 in Karnal 20 liter milk'):");
  const parsed = await parseWithOpenAI("Murrah buffalo under 90000 in Karnal 20 liter milk");
  console.log("Parsed Result:", JSON.stringify(parsed, null, 2));

  if (parsed) {
    console.log("\nTesting generateOpenAISummary:");
    const summary = await generateOpenAISummary("Murrah buffalo under 90000", [
      { name: "Lakshmi Murrah", breed: "Murrah", price: 85000, milk_capacity_min: 18, milk_capacity_max: 22, location: "Karnal" }
    ], [
      { business_name: "Vig Diary Farm", name: "Vikram Yadav", city: "Karnal", state: "Haryana", gst_number: "07AABCS1429B1Z1" }
    ]);
    console.log("Summary Result:", summary);
  }
})();
