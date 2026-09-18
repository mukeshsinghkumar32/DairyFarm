import { useEffect, useState } from "react";

const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिंदी" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ur", label: "Urdu", native: "اردو" },
];

export default function LanguageSelector({ className = "lang-select" }) {
  const [selectedLang, setSelectedLang] = useState(() => {
    // Read from googtrans cookie (/en/hi, /en/pa, etc.)
    const match = document.cookie.match(/googtrans=\/en\/([a-zA-Z-]+)/);
    if (match && match[1]) return match[1];
    return localStorage.getItem("preferred_lang") || "en";
  });

  useEffect(() => {
    // Sync with existing cookie or localStorage
    const match = document.cookie.match(/googtrans=\/en\/([a-zA-Z-]+)/);
    const currentLang = match && match[1] ? match[1] : (localStorage.getItem("preferred_lang") || "en");
    if (currentLang !== selectedLang) {
      setSelectedLang(currentLang);
    }
  }, []);

  const changeLanguage = (langCode) => {
    setSelectedLang(langCode);
    localStorage.setItem("preferred_lang", langCode);

    const host = window.location.hostname;

    if (langCode === "en") {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=/en/en; path=/;";
      if (host && host.includes(".")) {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${host};`;
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${host};`;
        document.cookie = `googtrans=/en/en; path=/; domain=${host};`;
        document.cookie = `googtrans=/en/en; path=/; domain=.${host};`;
      }
    } else {
      document.cookie = `googtrans=/en/${langCode}; path=/;`;
      if (host && host.includes(".")) {
        document.cookie = `googtrans=/en/${langCode}; path=/; domain=${host};`;
        document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${host};`;
      }
    }

    // Trigger Google combo if present
    const combo = document.querySelector(".goog-te-combo");
    if (combo) {
      combo.value = langCode;
      combo.dispatchEvent(new Event("change"));
    } else {
      window.location.reload();
    }
  };

  return (
    <select
      className={className}
      value={selectedLang}
      onChange={(e) => changeLanguage(e.target.value)}
      aria-label="Select Language"
    >
      <option value="en">🌐 English</option>
      {LANGUAGES.filter((l) => l.code !== "en").map((l) => (
        <option key={l.code} value={l.code}>
          {l.native} ({l.label})
        </option>
      ))}
    </select>
  );
}
