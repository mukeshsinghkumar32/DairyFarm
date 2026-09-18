const mongoose = require("mongoose");
const StateCity = require("../../models/StateCity");

// Comprehensive Indian States & Major Cities Dataset
const DEFAULT_STATE_CITIES = [
  {
    state: "Maharashtra",
    state_key: "MH",
    cities: [
      "Mumbai",
      "Pune",
      "Nagpur",
      "Nashik",
      "Thane",
      "Aurangabad",
      "Solapur",
      "Kolhapur",
      "Amravati",
      "Navi Mumbai",
      "Sangli",
      "Jalgaon",
      "Akola",
      "Latur",
      "Dhule",
      "Ahmednagar",
      "Chandrapur",
      "Parbhani",
      "Satara",
      "Beed",
      "Yavatmal",
      "Nanded",
      "Gondia",
      "Wardha",
      "Baramati",
    ],
  },
  {
    state: "Haryana",
    state_key: "HR",
    cities: [
      "Karnal",
      "Ambala",
      "Hisar",
      "Rohtak",
      "Panipat",
      "Sonipat",
      "Gurugram",
      "Faridabad",
      "Sirsa",
      "Yamunanagar",
      "Bhiwani",
      "Kurukshetra",
      "Jind",
      "Fatehabad",
      "Panchkula",
      "Kaithal",
      "Rewari",
      "Palwal",
      "Jhajjar",
      "Charkhi Dadri",
      "Narnaul",
    ],
  },
  {
    state: "Uttar Pradesh",
    state_key: "UP",
    cities: [
      "Jaunpur",
      "Varanasi",
      "Lucknow",
      "Kanpur",
      "Agra",
      "Prayagraj",
      "Meerut",
      "Ghaziabad",
      "Noida",
      "Bareilly",
      "Aligarh",
      "Moradabad",
      "Saharanpur",
      "Gorakhpur",
      "Faizabad",
      "Jhansi",
      "Muzaffarnagar",
      "Mathura",
      "Budaun",
      "Rampur",
      "Shahjahanpur",
      "Firozabad",
      "Etawah",
      "Sitapur",
      "Bulandshahr",
    ],
  },
  {
    state: "Punjab",
    state_key: "PB",
    cities: [
      "Ludhiana",
      "Amritsar",
      "Jalandhar",
      "Patiala",
      "Bathinda",
      "Mohali",
      "Hoshiarpur",
      "Batala",
      "Pathankot",
      "Moga",
      "Abohar",
      "Malerkotla",
      "Khanna",
      "Muktsar",
      "Barnala",
      "Firozpur",
      "Kapurthala",
      "Phagwara",
      "Sangrur",
      "Faridkot",
    ],
  },
  {
    state: "Gujarat",
    state_key: "GJ",
    cities: [
      "Ahmedabad",
      "Surat",
      "Vadodara",
      "Rajkot",
      "Bhavnagar",
      "Jamnagar",
      "Junagadh",
      "Gandhinagar",
      "Anand",
      "Navsari",
      "Morbi",
      "Nadiad",
      "Surendranagar",
      "Bharuch",
      "Mehsana",
      "Bhuj",
      "Porbandar",
      "Palanpur",
      "Valsad",
      "Vapi",
      "Gondal",
      "Amreli",
      "Godhra",
      "Patan",
    ],
  },
  {
    state: "Rajasthan",
    state_key: "RJ",
    cities: [
      "Jaipur",
      "Jodhpur",
      "Kota",
      "Bikaner",
      "Ajmer",
      "Udaipur",
      "Bhilwara",
      "Alwar",
      "Bharatpur",
      "Sikar",
      "Pali",
      "Sri Ganganagar",
      "Hanumangarh",
      "Beawar",
      "Tonk",
      "Kishangarh",
      "Churu",
      "Jhunjhunu",
      "Barmer",
      "Nagaur",
      "Sawai Madhopur",
    ],
  },
  {
    state: "Madhya Pradesh",
    state_key: "MP",
    cities: [
      "Indore",
      "Bhopal",
      "Jabalpur",
      "Gwalior",
      "Ujjain",
      "Sagar",
      "Dewas",
      "Satna",
      "Ratlam",
      "Rewa",
      "Murwara",
      "Singrauli",
      "Burhanpur",
      "Khandwa",
      "Morena",
      "Bhind",
      "Chhindwara",
      "Guna",
      "Shivpuri",
      "Vidisha",
      "Chhatarpur",
      "Damoh",
      "Mandsaur",
      "Khargone",
      "Neemuch",
    ],
  },
  {
    state: "Bihar",
    state_key: "BR",
    cities: [
      "Patna",
      "Gaya",
      "Bhagalpur",
      "Muzaffarpur",
      "Purnia",
      "Darbhanga",
      "Bihar Sharif",
      "Arrah",
      "Begusarai",
      "Katihar",
      "Munger",
      "Chhapra",
      "Danapur",
      "Bettiah",
      "Saharsa",
      "Sasaram",
      "Hajipur",
      "Dehri",
      "Siwan",
      "Motihari",
      "Nawada",
      "Bagaha",
      "Buxar",
      "Kishanganj",
      "Sitamarhi",
    ],
  },
  {
    state: "Andhra Pradesh",
    state_key: "AP",
    cities: [
      "Visakhapatnam",
      "Vijayawada",
      "Guntur",
      "Nellore",
      "Kurnool",
      "Kakinada",
      "Rajahmundry",
      "Kadapa",
      "Mangalagiri",
      "Tirupati",
      "Anantapur",
      "Ongole",
      "Vizianagaram",
      "Eluru",
      "Nandyal",
      "Machilipatnam",
      "Adoni",
      "Tenali",
      "Chittoor",
      "Hindupur",
    ],
  },
  {
    state: "Karnataka",
    state_key: "KA",
    cities: [
      "Bengaluru",
      "Mysuru",
      "Hubballi-Dharwad",
      "Mangaluru",
      "Belagavi",
      "Kalaburagi",
      "Davanagere",
      "Ballari",
      "Vijayapura",
      "Shivamogga",
      "Tumakuru",
      "Raichur",
      "Bidar",
      "Hosapete",
      "Gadag-Betageri",
      "Robertsonpet",
      "Hassan",
      "Bhadravati",
      "Chitradurga",
      "Udupi",
    ],
  },
  {
    state: "Tamil Nadu",
    state_key: "TN",
    cities: [
      "Chennai",
      "Coimbatore",
      "Madurai",
      "Tiruchirappalli",
      "Salem",
      "Tirunelveli",
      "Tiruppur",
      "Ranipet",
      "Nagercoil",
      "Thanjavur",
      "Vellore",
      "Kancheepuram",
      "Erode",
      "Tiruvannamalai",
      "Pollachi",
      "Rajapalayam",
      "Sivakasi",
      "Pudukkottai",
      "Neyveli",
      "Nagapattinam",
    ],
  },
  {
    state: "Telangana",
    state_key: "TG",
    cities: [
      "Hyderabad",
      "Warangal",
      "Nizamabad",
      "Khammam",
      "Karimnagar",
      "Ramagundam",
      "Mahbubnagar",
      "Nalgonda",
      "Adilabad",
      "Suryapet",
      "Miryalaguda",
      "Siddipet",
      "Jagtial",
      "Mancherial",
      "Nirmal",
    ],
  },
  {
    state: "West Bengal",
    state_key: "WB",
    cities: [
      "Kolkata",
      "Asansol",
      "Siliguri",
      "Durgapur",
      "Bardhaman",
      "Malda",
      "Baharampur",
      "Habra",
      "Kharagpur",
      "Shantipur",
      "Dankuni",
      "Dhulian",
      "Ranaghat",
      "Haldia",
      "Raiganj",
      "Krishnanagar",
      "Nabadwip",
      "Midnapore",
      "Jalpaiguri",
      "Balurghat",
    ],
  },
  {
    state: "Kerala",
    state_key: "KL",
    cities: [
      "Thiruvananthapuram",
      "Kochi",
      "Kozhikode",
      "Kollam",
      "Thrissur",
      "Palakkad",
      "Alappuzha",
      "Malappuram",
      "Ponnani",
      "Vatakara",
      "Kanhangad",
      "Taliparamba",
      "Koyilandy",
      "Neyyattinkara",
      "Kayamkulam",
      "Nedumangad",
      "Kannur",
      "Tirur",
      "Kottayam",
      "Kasaragod",
    ],
  },
  {
    state: "Odisha",
    state_key: "OR",
    cities: [
      "Bhubaneswar",
      "Cuttack",
      "Rourkela",
      "Berhampur",
      "Sambalpur",
      "Puri",
      "Balasore",
      "Bhadrak",
      "Baripada",
      "Jharsuguda",
      "Jeypore",
      "Bargarh",
      "Rayagada",
      "Bolangir",
      "Dhenkanal",
    ],
  },
  {
    state: "Jharkhand",
    state_key: "JH",
    cities: [
      "Ranchi",
      "Jamshedpur",
      "Dhanbad",
      "Bokaro Steel City",
      "Deoghar",
      "Phusro",
      "Hazaribagh",
      "Giridih",
      "Ramgarh",
      "Medininagar",
      "Chirkunda",
      "Jhumri Telaiya",
      "Sahibganj",
      "Chaibasa",
    ],
  },
  {
    state: "Chhattisgarh",
    state_key: "CG",
    cities: [
      "Raipur",
      "Bhilai",
      "Bilaspur",
      "Korba",
      "Rajnandgaon",
      "Raigarh",
      "Jagdalpur",
      "Ambikapur",
      "Dhamtari",
      "Mahasamund",
    ],
  },
  {
    state: "Uttarakhand",
    state_key: "UK",
    cities: [
      "Dehradun",
      "Haridwar",
      "Roorkee",
      "Haldwani",
      "Rudrapur",
      "Kashipur",
      "Rishikesh",
      "Pithoragarh",
      "Ramnagar",
      "Manglaur",
      "Kotdwar",
    ],
  },
  {
    state: "Himachal Pradesh",
    state_key: "HP",
    cities: [
      "Shimla",
      "Dharamshala",
      "Solan",
      "Mandi",
      "Palampur",
      "Baddi",
      "Nahan",
      "Paonta Sahib",
      "Sundarnagar",
      "Kullu",
      "Hamirpur",
      "Una",
    ],
  },
  {
    state: "Jammu and Kashmir",
    state_key: "JK",
    cities: [
      "Srinagar",
      "Jammu",
      "Anantnag",
      "Baramulla",
      "Kathua",
      "Sopore",
      "Udhampur",
      "Punch",
      "Rajouri",
    ],
  },
  {
    state: "Goa",
    state_key: "GA",
    cities: [
      "Panaji",
      "Margao",
      "Vasco da Gama",
      "Mapusa",
      "Ponda",
      "Bicholim",
    ],
  },
  {
    state: "Delhi",
    state_key: "DL",
    cities: [
      "New Delhi",
      "North Delhi",
      "South Delhi",
      "East Delhi",
      "West Delhi",
      "Central Delhi",
      "Dwarka",
      "Rohini",
    ],
  },
  {
    state: "Chandigarh",
    state_key: "CH",
    cities: ["Chandigarh"],
  },
  {
    state: "Assam",
    state_key: "AS",
    cities: [
      "Guwahati",
      "Silchar",
      "Dibrugarh",
      "Jorhat",
      "Nagaon",
      "Tinsukia",
      "Tezpur",
    ],
  },
];

/**
 * Normalizes raw documents from the MongoDB `statecities` collection
 * and merges them seamlessly with standard Indian State/City datasets.
 */
async function loadMergedStateCities() {
  const map = new Map();

  // 1. Initialize with default comprehensive dataset
  // for (const item of DEFAULT_STATE_CITIES) {
  //   const key = item.state.toLowerCase().trim();
  //   map.set(key, {
  //     state: item.state,
  //     state_key: item.state_key || "",
  //     cities: new Set(item.cities),
  //   });
  // }

  // 2. Fetch from MongoDB collection `statecities`
  try {
    let dbDocs = [];
    if (mongoose.connection && mongoose.connection.db) {
      dbDocs = await mongoose.connection.db
        .collection("statecities")
        .find({})
        .toArray();
    } else {
      dbDocs = await StateCity.find({});
    }

    if (Array.isArray(dbDocs) && dbDocs.length > 0) {
      for (const doc of dbDocs) {
        // Document format 1: { state: "Maharashtra", cities: [...] }
        const stateName =
          doc.state ||
          doc.state_name ||
          doc.name ||
          doc.State ||
          doc.StateName ||
          doc.stateName;

        const stateKey = doc.state_key || doc.key || doc.code || "";

        if (stateName && typeof stateName === "string") {
          const normKey = stateName.toLowerCase().trim();
          if (!map.has(normKey)) {
            map.set(normKey, {
              state: stateName.trim(),
              state_key: stateKey,
              cities: new Set(),
            });
          }

          const entry = map.get(normKey);
          if (stateKey && !entry.state_key) {
            entry.state_key = stateKey;
          }

          // Array of cities
          const citiesList =
            doc.cities ||
            doc.city_list ||
            doc.Cities ||
            doc.districts ||
            doc.Districts;
          if (Array.isArray(citiesList)) {
            for (const c of citiesList) {
              if (typeof c === "string" && c.trim()) {
                entry.cities.add(c.trim());
              } else if (c && typeof c === "object" && (c.name || c.city)) {
                entry.cities.add((c.name || c.city).trim());
              }
            }
          } else if (typeof doc.city === "string" && doc.city.trim()) {
            entry.cities.add(doc.city.trim());
          }
        } else {
          // Document format 2: Key-value pair like { "Maharashtra": ["Mumbai", ...] }
          for (const [k, v] of Object.entries(doc)) {
            if (
              k === "_id" ||
              k === "__v" ||
              k === "createdAt" ||
              k === "updatedAt"
            ) {
              continue;
            }
            if (Array.isArray(v) && typeof k === "string") {
              const normKey = k.toLowerCase().trim();
              if (!map.has(normKey)) {
                map.set(normKey, {
                  state: k.trim(),
                  state_key: "",
                  cities: new Set(),
                });
              }
              const entry = map.get(normKey);
              for (const c of v) {
                if (typeof c === "string" && c.trim()) {
                  entry.cities.add(c.trim());
                }
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn(
      "Notice: reading statecities collection fallback:",
      err.message,
    );
  }

  // Convert map to sorted array
  const result = Array.from(map.values()).map((item) => ({
    state: item.state,
    state_key: item.state_key || item.state.slice(0, 2).toUpperCase(),
    cities: Array.from(item.cities).sort((a, b) => a.localeCompare(b)),
  }));

  result.sort((a, b) => a.state.localeCompare(b.state));
  return result;
}

// ─── GET /api/v1/locations/state-cities ──────────────────────────────────────
exports.getStateCities = async (req, res) => {
  try {
    const list = await loadMergedStateCities();
    return res.json({
      success: true,
      total: list.length,
      data: list,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/v1/locations/states ───────────────────────────────────────────
exports.getStates = async (req, res) => {
  try {
    const list = await loadMergedStateCities();
    const states = list.map((item) => ({
      state: item.state,
      state_key: item.state_key,
      total_cities: item.cities.length,
    }));
    return res.json({
      success: true,
      total: states.length,
      data: states,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/v1/locations/cities?state=Maharashtra ──────────────────────────
exports.getCities = async (req, res) => {
  try {
    const requestedState = (
      req.query.state ||
      req.query.state_name ||
      ""
    ).trim();
    if (!requestedState) {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'state' is required.",
      });
    }

    const list = await loadMergedStateCities();
    const match = list.find(
      (s) =>
        s.state.toLowerCase() === requestedState.toLowerCase() ||
        s.state_key.toLowerCase() === requestedState.toLowerCase(),
    );

    if (!match) {
      return res.json({
        success: true,
        state: requestedState,
        data: [],
      });
    }

    return res.json({
      success: true,
      state: match.state,
      state_key: match.state_key,
      total: match.cities.length,
      data: match.cities,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
