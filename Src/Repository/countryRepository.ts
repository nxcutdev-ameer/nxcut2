import { supabase } from "../Utils/supabase";

export interface CountryCode {
  id: string;
  code: string;
  country: string;
  country_code?: string;
  flag?: string;
}

export const countryRepository = {
  async getCountryCodes(): Promise<CountryCode[]> {
    try {
      // First try to fetch from the database
      const { data, error } = await supabase
        .from("country_codes")
        .select("*")
        .order("country", { ascending: true });

      if (!error && data && data.length > 0) {
        return data;
      }

      // If no data in database, return default country codes
      return this.getDefaultCountryCodes();
    } catch (e) {
      console.log("Error fetching country codes:", e);
      return this.getDefaultCountryCodes();
    }
  },

  getDefaultCountryCodes(): CountryCode[] {
    return [
      { id: "1", code: "+971", country: "United Arab Emirates", country_code: "AE" },
      { id: "2", code: "+1", country: "United States", country_code: "US" },
      { id: "3", code: "+44", country: "United Kingdom", country_code: "GB" },
      { id: "4", code: "+91", country: "India", country_code: "IN" },
      { id: "5", code: "+92", country: "Pakistan", country_code: "PK" },
      { id: "6", code: "+966", country: "Saudi Arabia", country_code: "SA" },
      { id: "7", code: "+974", country: "Qatar", country_code: "QA" },
      { id: "8", code: "+968", country: "Oman", country_code: "OM" },
      { id: "9", code: "+965", country: "Kuwait", country_code: "KW" },
      { id: "10", code: "+973", country: "Bahrain", country_code: "BH" },
      { id: "11", code: "+20", country: "Egypt", country_code: "EG" },
      { id: "12", code: "+962", country: "Jordan", country_code: "JO" },
      { id: "13", code: "+961", country: "Lebanon", country_code: "LB" },
      { id: "14", code: "+213", country: "Algeria", country_code: "DZ" },
      { id: "15", code: "+212", country: "Morocco", country_code: "MA" },
      { id: "16", code: "+216", country: "Tunisia", country_code: "TN" },
      { id: "17", code: "+249", country: "Sudan", country_code: "SD" },
      { id: "18", code: "+964", country: "Iraq", country_code: "IQ" },
      { id: "19", code: "+967", country: "Yemen", country_code: "YE" },
      { id: "20", code: "+963", country: "Syria", country_code: "SY" },
      { id: "21", code: "+86", country: "China", country_code: "CN" },
      { id: "22", code: "+81", country: "Japan", country_code: "JP" },
      { id: "23", code: "+82", country: "South Korea", country_code: "KR" },
      { id: "24", code: "+49", country: "Germany", country_code: "DE" },
      { id: "25", code: "+33", country: "France", country_code: "FR" },
      { id: "26", code: "+39", country: "Italy", country_code: "IT" },
      { id: "27", code: "+34", country: "Spain", country_code: "ES" },
      { id: "28", code: "+7", country: "Russia", country_code: "RU" },
      { id: "29", code: "+61", country: "Australia", country_code: "AU" },
      { id: "30", code: "+1", country: "Canada", country_code: "CA" },
      { id: "31", code: "+55", country: "Brazil", country_code: "BR" },
      { id: "32", code: "+52", country: "Mexico", country_code: "MX" },
      { id: "33", code: "+54", country: "Argentina", country_code: "AR" },
      { id: "34", code: "+27", country: "South Africa", country_code: "ZA" },
      { id: "35", code: "+234", country: "Nigeria", country_code: "NG" },
      { id: "36", code: "+254", country: "Kenya", country_code: "KE" },
      { id: "37", code: "+256", country: "Uganda", country_code: "UG" },
      { id: "38", code: "+255", country: "Tanzania", country_code: "TZ" },
      { id: "39", code: "+233", country: "Ghana", country_code: "GH" },
      { id: "40", code: "+251", country: "Ethiopia", country_code: "ET" },
      { id: "41", code: "+62", country: "Indonesia", country_code: "ID" },
      { id: "42", code: "+60", country: "Malaysia", country_code: "MY" },
      { id: "43", code: "+65", country: "Singapore", country_code: "SG" },
      { id: "44", code: "+63", country: "Philippines", country_code: "PH" },
      { id: "45", code: "+66", country: "Thailand", country_code: "TH" },
      { id: "46", code: "+84", country: "Vietnam", country_code: "VN" },
      { id: "47", code: "+880", country: "Bangladesh", country_code: "BD" },
      { id: "48", code: "+94", country: "Sri Lanka", country_code: "LK" },
      { id: "49", code: "+977", country: "Nepal", country_code: "NP" },
      { id: "50", code: "+90", country: "Turkey", country_code: "TR" }
    ];
  },

  async searchCountryCodes(searchTerm: string): Promise<CountryCode[]> {
    const allCodes = await this.getCountryCodes();
    const term = searchTerm.toLowerCase();
    
    return allCodes.filter(
      (cc) =>
        cc.country.toLowerCase().includes(term) ||
        cc.code.includes(searchTerm) ||
        (cc.country_code && cc.country_code.toLowerCase().includes(term))
    );
  }
};
