/**
 * OpenAI Integration Service for Sohani Dairy Farm
 * Connects OpenAI (ChatGPT / GPT-4o-mini) with MongoDB 'sohani_dairy'
 * Collections: 'products' (Product) & 'sellers' (Seller)
 */

const path = require("path");
const dotenv = require("dotenv");

function getApiKey() {
  try {
    dotenv.config({ path: path.join(__dirname, "..", ".env"), override: true });
  } catch (e) {}
  return (process.env.OPENAI_API_KEY || "").trim();
}

function getModel() {
  try {
    dotenv.config({ path: path.join(__dirname, "..", ".env"), override: true });
  } catch (e) {}
  return (process.env.OPENAI_MODEL || "gpt-4o-mini").trim();
}

/**
 * Ask OpenAI ChatGPT to parse natural language user search query
 * into structured database filters for 'Product' and 'Seller' collections.
 */
async function parseWithOpenAI(queryStr) {
  const apiKey = getApiKey();
  if (!apiKey || apiKey.includes("your_openai_api_key")) {
    console.log("[OpenAI] No OPENAI_API_KEY provided in .env, falling back to local NLP.");
    return null;
  }

  const model = getModel();

  try {
    console.log(`[OpenAI AI Search] Analyzing user query with ${model}: "${queryStr}"`);

    const systemPrompt = `You are an expert AI Dairy Assistant connected directly to the MongoDB 'sohani_dairy' database.
The user wants to search two collections:
1. 'Product' collection (Cattle listings):
   - name (string)
   - description (string)
   - price (number)
   - milk_capacity_min (number in liters/day)
   - milk_capacity_max (number in liters/day)
   - location (string: city/state/region)
   - weight (string e.g. "450 kg")
   - breed (string e.g. "Murrah", "Gir", "HF", "Sahiwal", "Jersey", "Tharparkar")
   - delivery_time (string e.g. "2-3 days")
2. 'Seller' collection (Verified Dairy Farms & Suppliers):
   - name (owner name)
   - business_name (farm name)
   - business_address (full address)
   - state (Indian state)
   - city (city/district)
   - pincode (6-digit Indian PIN)
   - gst_number (GSTIN)

Analyze the user's natural language search query. Extract all explicit and implicit intents (e.g., "high milk" -> min 18L, "under 80k" -> max price 80000, "in karnal" -> location/city "Karnal", "vikram" -> seller name, "GST" -> gst_number).

Return ONLY a valid JSON object without markdown formatting:
{
  "target": "all" | "product" | "seller",
  "breed": string or null,
  "price": { "min": number or null, "max": number or null },
  "milk_capacity": { "min": number or null, "max": number or null },
  "location": string or null,
  "state": string or null,
  "city": string or null,
  "pincode": string or null,
  "gst_number": string or null,
  "weight": string or null,
  "delivery_time": string or null,
  "seller_name": string or null,
  "business_name": string or null,
  "keywords": string[],
  "ai_intent_summary": string
}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Search query: "${queryStr}"` },
        ],
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[OpenAI AI Search] API returned status ${response.status}:`, errText);
      return {
        success: false,
        status: response.status,
        error: errText,
      };
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content);
      console.log(`[OpenAI AI Search] Successfully parsed with OpenAI:`, parsed);
      return {
        success: true,
        data: parsed,
      };
    }
  } catch (err) {
    console.warn(`[OpenAI AI Search] Error calling OpenAI:`, err.message);
    return {
      success: false,
      error: err.message,
    };
  }
  return null;
}

/**
 * Generate an intelligent AI Advisor Recommendation summary via OpenAI
 * based on matched cattle and sellers from the sohani_dairy database.
 */
async function generateOpenAISummary(queryStr, products = [], sellers = []) {
  const apiKey = getApiKey();
  if (!apiKey || apiKey.includes("your_openai_api_key")) {
    return null;
  }

  const model = getModel();

  try {
    const pSummary = products.slice(0, 4).map((p) => ({
      name: p.name,
      breed: p.breed || p.category?.name || "Cattle",
      price: p.price ? `₹${p.price}` : "On Call",
      milk_capacity: `${p.milk_capacity_min || ""}-${p.milk_capacity_max || ""} L/day`,
      location: p.location,
    }));

    const sSummary = sellers.slice(0, 4).map((s) => ({
      farm_name: s.business_name || s.name,
      owner: s.name,
      location: `${s.city || ""}, ${s.state || ""}`,
      pincode: s.pincode,
      gst: s.gst_number,
    }));

    const prompt = `The user searched for: "${queryStr}".
Matched cattle from sohani_dairy: ${JSON.stringify(pSummary)}
Matched dairy farms from sohani_dairy: ${JSON.stringify(sSummary)}

Write a professional, concise 1-2 sentence AI Advisor note for this buyer, summarizing the best matches found and practical dairy farming advice.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.5,
        max_tokens: 150,
        messages: [
          {
            role: "system",
            content: "You are the Sohani Dairy Marketplace AI Advisor recommending cattle and verified sellers to Indian dairy farmers.",
          },
          { role: "user", content: prompt },
        ],
      }),
      signal: AbortSignal.timeout(6000),
    });

    if (response.ok) {
      const data = await response.json();
      return data?.choices?.[0]?.message?.content?.trim() || null;
    }
  } catch (err) {
    console.warn("[OpenAI AI Search] Summary generation error:", err.message);
  }
  return null;
}

module.exports = {
  parseWithOpenAI,
  generateOpenAISummary,
};
