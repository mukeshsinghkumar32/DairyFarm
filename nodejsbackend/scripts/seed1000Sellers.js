/**
 * 1000 Seller Dummy Records Seeder
 * Distributes 1000 active sellers evenly across all 28 Indian states and their cities.
 *
 * Matching sample record format:
 * {
 *   name: "Vikram Yadav",
 *   username: "vikram_1789549821471",
 *   email: "gst_seller_1789549821458@example.com",
 *   phone: "9876501234",
 *   password: "$2a$12$bNxQ1OHShvBPwVr0zuXBL.ZGxbpLTNlhFcec01MM8cN98xZy6fjQy",
 *   business_name: "Vig Diary Farm",
 *   business_address: "",
 *   gst_number: "07AABCS1429B1Z1",
 *   state: "Haryana",
 *   city: "Karnal",
 *   pincode: "132001",
 *   banner_image: "",
 *   avatar: "/uploads/sellers/1789559785632-274341473.png",
 *   business_image: "/uploads/sellers/1789559785632-274341473.png",
 *   role: "seller",
 *   status: "active",
 *   featured: true
 * }
 */

require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const mongoose = require("mongoose");
const Seller = require("../models/Seller");
const StateCity = require("../models/StateCity");

// 28 Indian States with GST code, standard key, base pincode, and major cities
const ALL_28_INDIAN_STATES = [
  {
    state: "Andhra Pradesh",
    state_key: "AP",
    gst_code: "37",
    pincode_prefix: "52",
    cities: [
      "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool",
      "Rajahmundry", "Tirupati", "Kakinada", "Kadapa", "Anantapur",
      "Eluru", "Ongole", "Nandyal", "Machilipatnam", "Tenali"
    ]
  },
  {
    state: "Arunachal Pradesh",
    state_key: "AR",
    gst_code: "12",
    pincode_prefix: "79",
    cities: [
      "Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro",
      "Bomdila", "Aalo", "Tezu", "Roing"
    ]
  },
  {
    state: "Assam",
    state_key: "AS",
    gst_code: "18",
    pincode_prefix: "78",
    cities: [
      "Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon",
      "Tinsukia", "Tezpur", "Bongaigaon", "Karimganj", "Sivasagar"
    ]
  },
  {
    state: "Bihar",
    state_key: "BR",
    gst_code: "10",
    pincode_prefix: "80",
    cities: [
      "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia",
      "Darbhanga", "Bihar Sharif", "Arrah", "Begusarai", "Katihar",
      "Munger", "Chhapra", "Danapur", "Saharsa", "Sasaram", "Hajipur", "Dehri", "Siwan", "Motihari", "Nawada"
    ]
  },
  {
    state: "Chhattisgarh",
    state_key: "CG",
    gst_code: "22",
    pincode_prefix: "49",
    cities: [
      "Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon",
      "Jagdalpur", "Raigarh", "Ambikapur", "Durg", "Dhamtari"
    ]
  },
  {
    state: "Goa",
    state_key: "GA",
    gst_code: "30",
    pincode_prefix: "40",
    cities: [
      "Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim"
    ]
  },
  {
    state: "Gujarat",
    state_key: "GJ",
    gst_code: "24",
    pincode_prefix: "38",
    cities: [
      "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar",
      "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Navsari",
      "Morbi", "Nadiad", "Surendranagar", "Bharuch", "Mehsana", "Bhuj", "Porbandar", "Palanpur", "Valsad", "Gondal"
    ]
  },
  {
    state: "Haryana",
    state_key: "HR",
    gst_code: "06",
    pincode_prefix: "13",
    cities: [
      "Karnal", "Ambala", "Hisar", "Rohtak", "Panipat",
      "Sonipat", "Gurugram", "Faridabad", "Sirsa", "Yamunanagar",
      "Bhiwani", "Kurukshetra", "Jind", "Fatehabad", "Panchkula",
      "Kaithal", "Rewari", "Palwal", "Jhajjar", "Charkhi Dadri", "Narnaul"
    ]
  },
  {
    state: "Himachal Pradesh",
    state_key: "HP",
    gst_code: "02",
    pincode_prefix: "17",
    cities: [
      "Shimla", "Dharamshala", "Solan", "Mandi", "Palampur",
      "Baddi", "Nahan", "Paonta Sahib", "Kullu", "Hamirpur", "Bilaspur", "Una"
    ]
  },
  {
    state: "Jharkhand",
    state_key: "JH",
    gst_code: "20",
    pincode_prefix: "83",
    cities: [
      "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar",
      "Hazaribagh", "Giridih", "Ramgarh", "Medininagar", "Chirkunda"
    ]
  },
  {
    state: "Karnataka",
    state_key: "KA",
    gst_code: "29",
    pincode_prefix: "56",
    cities: [
      "Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Belagavi",
      "Davanagere", "Ballari", "Vijayapura", "Shivamogga", "Tumakuru",
      "Bidar", "Hosapete", "Gadag", "Udupi", "Hassan", "Raichur"
    ]
  },
  {
    state: "Kerala",
    state_key: "KL",
    gst_code: "32",
    pincode_prefix: "68",
    cities: [
      "Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam",
      "Palakkad", "Alappuzha", "Kannur", "Kottayam", "Malappuram", "Manjeri", "Thalassery"
    ]
  },
  {
    state: "Madhya Pradesh",
    state_key: "MP",
    gst_code: "23",
    pincode_prefix: "45",
    cities: [
      "Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain",
      "Sagar", "Dewas", "Satna", "Ratlam", "Rewa",
      "Murwara", "Singrauli", "Burhanpur", "Khandwa", "Bhind", "Chhindwara", "Guna", "Shivpuri", "Vidisha", "Damoh"
    ]
  },
  {
    state: "Maharashtra",
    state_key: "MH",
    gst_code: "27",
    pincode_prefix: "41",
    cities: [
      "Mumbai", "Pune", "Nagpur", "Nashik", "Thane",
      "Aurangabad", "Solapur", "Kolhapur", "Amravati", "Navi Mumbai",
      "Sangli", "Jalgaon", "Akola", "Latur", "Dhule",
      "Ahmednagar", "Chandrapur", "Parbhani", "Satara", "Beed", "Yavatmal", "Nanded", "Gondia", "Wardha", "Baramati"
    ]
  },
  {
    state: "Manipur",
    state_key: "MN",
    gst_code: "14",
    pincode_prefix: "79",
    cities: [
      "Imphal", "Churachandpur", "Thoubal", "Kakching", "Ukhrul", "Senapati"
    ]
  },
  {
    state: "Meghalaya",
    state_key: "ML",
    gst_code: "17",
    pincode_prefix: "79",
    cities: [
      "Shillong", "Tura", "Jowai", "Nongpoh", "Williamnagar", "Baghmara"
    ]
  },
  {
    state: "Mizoram",
    state_key: "MZ",
    gst_code: "15",
    pincode_prefix: "79",
    cities: [
      "Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib", "Lawngtlai"
    ]
  },
  {
    state: "Nagaland",
    state_key: "NL",
    gst_code: "13",
    pincode_prefix: "79",
    cities: [
      "Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Zunheboto"
    ]
  },
  {
    state: "Odisha",
    state_key: "OD",
    gst_code: "21",
    pincode_prefix: "75",
    cities: [
      "Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur",
      "Puri", "Balasore", "Bhadrak", "Baripada", "Jharsuguda"
    ]
  },
  {
    state: "Punjab",
    state_key: "PB",
    gst_code: "03",
    pincode_prefix: "14",
    cities: [
      "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda",
      "Mohali", "Hoshiarpur", "Batala", "Pathankot", "Moga",
      "Abohar", "Malerkotla", "Khanna", "Phagwara", "Muktsar", "Barnala", "Rajpura", "Firozpur", "Kapurthala", "Sangrur"
    ]
  },
  {
    state: "Rajasthan",
    state_key: "RJ",
    gst_code: "08",
    pincode_prefix: "30",
    cities: [
      "Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer",
      "Udaipur", "Bhilwara", "Alwar", "Bharatpur", "Sikar",
      "Pali", "Sri Ganganagar", "Kishangarh", "Baran", "Hanumangarh", "Beawar", "Dholpur", "Sawai Madhopur", "Churu", "Nagaur"
    ]
  },
  {
    state: "Sikkim",
    state_key: "SK",
    gst_code: "11",
    pincode_prefix: "73",
    cities: [
      "Gangtok", "Namchi", "Geyzing", "Mangan", "Rangpo", "Singtam"
    ]
  },
  {
    state: "Tamil Nadu",
    state_key: "TN",
    gst_code: "33",
    pincode_prefix: "60",
    cities: [
      "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
      "Tiruppur", "Erode", "Tirunelveli", "Vellore", "Thoothukudi",
      "Dindigul", "Thanjavur", "Ranipet", "Sivakasi", "Karur", "Ooty", "Hosur", "Nagercoil", "Kanchipuram", "Kumarakonam"
    ]
  },
  {
    state: "Telangana",
    state_key: "TS",
    gst_code: "36",
    pincode_prefix: "50",
    cities: [
      "Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar",
      "Ramagundam", "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet", "Siddipet", "Miryalaguda"
    ]
  },
  {
    state: "Tripura",
    state_key: "TR",
    gst_code: "16",
    pincode_prefix: "79",
    cities: [
      "Agartala", "Dharmanagar", "Udaipur", "Kailashahar", "Belonia", "Khowai"
    ]
  },
  {
    state: "Uttar Pradesh",
    state_key: "UP",
    gst_code: "09",
    pincode_prefix: "22",
    cities: [
      "Jaunpur", "Varanasi", "Lucknow", "Kanpur", "Agra",
      "Prayagraj", "Meerut", "Ghaziabad", "Noida", "Bareilly",
      "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur", "Faizabad",
      "Jhansi", "Muzaffarnagar", "Mathura", "Budaun", "Rampur",
      "Shahjahanpur", "Firozabad", "Etawah", "Sitapur", "Bulandshahr"
    ]
  },
  {
    state: "Uttarakhand",
    state_key: "UK",
    gst_code: "05",
    pincode_prefix: "24",
    cities: [
      "Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur",
      "Kashipur", "Rishikesh", "Nainital", "Pithoragarh", "Kotdwar"
    ]
  },
  {
    state: "West Bengal",
    state_key: "WB",
    gst_code: "19",
    pincode_prefix: "70",
    cities: [
      "Kolkata", "Asansol", "Siliguri", "Durgapur", "Bardhaman",
      "Malda", "Baharampur", "Habra", "Kharagpur", "Shantipur",
      "Dankuni", "Dhulian", "Ranaghat", "Haldia", "Raiganj", "Krishnanagar", "Nabadwip", "Midnapore", "Jalpaiguri", "Balurghat"
    ]
  }
];

// Names for generating realistic seller profiles
const FIRST_NAMES = [
  "Vikram", "Ramesh", "Suresh", "Rajesh", "Mukesh", "Dinesh", "Mahesh", "Sanjay",
  "Sunil", "Anil", "Vijay", "Ajay", "Satish", "Prakash", "Amit", "Sumit",
  "Deepak", "Manoj", "Pradeep", "Harpreet", "Gurpreet", "Balvinder", "Jaswinder",
  "Devendra", "Ravindra", "Kuldeep", "Jitendra", "Shailendra", "Naresh", "Santosh",
  "Govind", "Gopal", "Radhey", "Krishna", "Ram", "Laxman", "Bharat", "Kailash",
  "Naveen", "Pawan", "Mohan", "Chandan", "Ashok", "Vinod", "Arun", "Tarun"
];

const LAST_NAMES = [
  "Yadav", "Chaudhary", "Patel", "Sharma", "Verma", "Singh", "Gurjar", "Pawar",
  "Patil", "Deshmukh", "Gaikwad", "Shinde", "Rathore", "Rajput", "Gill", "Dhillon",
  "Sandhu", "Grewal", "Reddy", "Rao", "Nair", "Menon", "Shetty", "Gowda",
  "Hegde", "Mishra", "Pandey", "Tiwari", "Dubey", "Gupta", "Agarwal", "Bishnoi",
  "Jat", "Ahir", "Meena", "Rawat", "Negi", "Thakur", "Ghosh", "Mukherjee"
];

const FARM_NAME_PREFIXES = [
  "Shree Krishna", "Kamdhenu", "Amrut", "Gau Seva", "Nandini", "Gokul", "Radha Krishna",
  "Surabhi", "Bhagwati", "Mahalaxmi", "Vrindavan", "Balaji", "Om Sai", "Shiv Shakti",
  "Pawan Putra", "Navrang", "Green Meadows", "Golden Horns", "Kisan Mitra", "Adarsh"
];

const FARM_NAME_TYPES = [
  "Dairy Farm", "Cattle Farm", "Breeders & Dairy", "Livestock Farm",
  "Agro Dairy Farm", "Dairy & Bull Center", "Cattle Breeding Farm"
];

// Pre-hashed bcrypt password matching user's requested sample
const SAMPLE_BCRYPT_PASSWORD =
  "$2a$12$bNxQ1OHShvBPwVr0zuXBL.ZGxbpLTNlhFcec01MM8cN98xZy6fjQy";

const DEFAULT_AVATAR = "/uploads/sellers/1789559785632-274341473.png";

// Helper: random item from array
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Generate valid GSTIN format: 2 digit code + 5 letters PAN + 4 digits + 1 letter + 1 entity code + 1 check character
function generateGstNumber(gstCode, idx) {
  const panLetters = "AABCS";
  const numPart = String(1000 + (idx % 8999)).padStart(4, "0");
  const entityChar = String.fromCharCode(65 + (idx % 26));
  const checkChar = ((idx % 9) + 1).toString();
  return `${gstCode}${panLetters}${numPart}${entityChar}1Z${checkChar}`;
}

// Generate unique 10-digit Indian phone
function generatePhone(idx) {
  const prefixes = ["98", "97", "96", "99", "88", "87", "89", "70", "79", "94"];
  const prefix = prefixes[idx % prefixes.length];
  const rest = String(10000000 + idx * 7919).slice(-8);
  return `${prefix}${rest}`;
}

async function seed1000Sellers() {
  const targetCount = 1000;
  console.log("════════════════════════════════════════════════════════════════");
  console.log(`🚀 Starting Seller Seeder for ${targetCount} dummy records...`);
  console.log("════════════════════════════════════════════════════════════════");

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB:", mongoose.connection.name);

    // 1. Check if statecities collection has custom records to merge
    let statesList = [...ALL_28_INDIAN_STATES];
    try {
      const dbStateCities = await StateCity.find({}).lean();
      if (dbStateCities && dbStateCities.length > 0) {
        console.log(`📦 Found ${dbStateCities.length} records in 'statecities' collection.`);
        const dbMap = new Map();
        for (const doc of dbStateCities) {
          const sName = (doc.state || doc.state_name || doc.name || "").trim();
          if (!sName) continue;
          const sKey = (doc.state_key || doc.key || "").trim();
          const cList = Array.isArray(doc.cities) ? doc.cities : [];
          dbMap.set(sName.toLowerCase(), { state: sName, state_key: sKey, cities: cList });
        }

        // Merge DB cities into statesList
        statesList = statesList.map((st) => {
          const fromDb = dbMap.get(st.state.toLowerCase());
          if (fromDb && fromDb.cities && fromDb.cities.length > 0) {
            const set = new Set([...st.cities, ...fromDb.cities]);
            return {
              ...st,
              state_key: fromDb.state_key || st.state_key,
              cities: Array.from(set),
            };
          }
          return st;
        });
      }
    } catch (e) {
      console.log("ℹ️ Using built-in 28 states list:", e.message);
    }

    console.log(`🗺️  Covering ${statesList.length} States:`);
    console.log(statesList.map((s) => `${s.state} (${s.state_key || s.gst_code})`).join(", "));

    // 2. Prepare 1000 dummy seller documents
    const timestampBase = 1789549800000;
    const sellers = [];

    // Distribute evenly across 28 states (~35-36 per state)
    for (let i = 0; i < targetCount; i++) {
      const stateObj = statesList[i % statesList.length];
      const city =
        stateObj.cities[(Math.floor(i / statesList.length)) % stateObj.cities.length] ||
        stateObj.cities[0] ||
        "City";

      const firstName = pickRandom(FIRST_NAMES);
      const lastName = pickRandom(LAST_NAMES);
      const fullName = `${firstName} ${lastName}`;

      const uniqueStamp = timestampBase + i;
      const username = `${firstName.toLowerCase()}_${uniqueStamp}`;
      const email = `gst_seller_${uniqueStamp}@example.com`;
      const phone = generatePhone(i);
      const gstNumber = generateGstNumber(stateObj.gst_code || "07", i);

      // Business Name: Variation of Farm Name or [Name] Dairy Farm
      let businessName = "";
      if (i % 3 === 0) {
        businessName = `${firstName} Dairy Farm`;
      } else if (i % 3 === 1) {
        businessName = `${pickRandom(FARM_NAME_PREFIXES)} ${pickRandom(FARM_NAME_TYPES)}`;
      } else {
        businessName = `${city} ${pickRandom(FARM_NAME_TYPES)}`;
      }

      // 6-digit Pincode
      const pincode = `${stateObj.pincode_prefix || "11"}${String(1000 + (i % 8999)).slice(-4)}`;

      // ~20% featured
      const isFeatured = (i % 5 === 0);

      // Random createdAt within last 90 days
      const daysAgo = Math.floor(Math.random() * 60) + 1;
      const createdTime = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      const updatedTime = new Date(createdTime.getTime() + 1000 * 60 * 60 * (Math.random() * 48));

      sellers.push({
        name: fullName,
        username: username,
        email: email,
        phone: phone,
        password: SAMPLE_BCRYPT_PASSWORD,
        business_name: businessName,
        business_address: `Plot ${12 + (i % 95)}, Near Rural Road, ${city}, ${stateObj.state}`,
        gst_number: gstNumber,
        state: stateObj.state,
        city: city,
        pincode: pincode,
        banner_image: "",
        avatar: DEFAULT_AVATAR,
        business_image: DEFAULT_AVATAR,
        role: "seller",
        status: "active",
        featured: isFeatured,
        createdAt: createdTime,
        updatedAt: updatedTime,
      });
    }

    console.log(`\n⏳ Inserting ${sellers.length} seller records into MongoDB...`);

    // Bulk insert with unordered to maximize throughput
    const result = await Seller.collection.insertMany(sellers, { ordered: false });
    const insertedCount = result.insertedCount || (result.insertedIds ? Object.keys(result.insertedIds).length : sellers.length);

    console.log(`\n✅ Successfully seeded ${insertedCount} dummy sellers!`);

    // Verification stats
    const totalInDb = await Seller.countDocuments();
    const activeCount = await Seller.countDocuments({ status: "active" });
    const featuredCount = await Seller.countDocuments({ featured: true });

    // Aggregate by states
    const stateStats = await Seller.aggregate([
      { $group: { _id: "$state", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log("\n📊 Summary Statistics:");
    console.log(`   • Total Sellers in DB: ${totalInDb}`);
    console.log(`   • Active Sellers:      ${activeCount}`);
    console.log(`   • Featured Sellers:    ${featuredCount}`);
    console.log(`   • States Represented:  ${stateStats.length} states`);
    console.log(`   • Sample States Distribution:`);
    stateStats.slice(0, 10).forEach((s) => {
      console.log(`     - ${s._id}: ${s.count} sellers`);
    });

    console.log("\n📋 Sample Record from Seed:");
    console.log(JSON.stringify(sellers[0], null, 2));

    console.log("\n🎉 Seller seed complete! Press Ctrl+C or process will exit.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seed1000Sellers();
