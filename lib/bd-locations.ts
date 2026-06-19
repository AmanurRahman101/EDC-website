// Bangladesh administrative divisions and their districts (zilas).
// Used for the cascading Division -> District selects in checkout.

export const BD_DIVISIONS: Record<string, string[]> = {
  Dhaka: [
    "Dhaka",
    "Gazipur",
    "Narayanganj",
    "Narsingdi",
    "Manikganj",
    "Munshiganj",
    "Tangail",
    "Kishoreganj",
    "Faridpur",
    "Gopalganj",
    "Madaripur",
    "Rajbari",
    "Shariatpur",
  ],
  Chattogram: [
    "Chattogram",
    "Cox's Bazar",
    "Cumilla",
    "Brahmanbaria",
    "Chandpur",
    "Feni",
    "Lakshmipur",
    "Noakhali",
    "Khagrachhari",
    "Rangamati",
    "Bandarban",
  ],
  Rajshahi: [
    "Rajshahi",
    "Bogura",
    "Joypurhat",
    "Naogaon",
    "Natore",
    "Chapainawabganj",
    "Pabna",
    "Sirajganj",
  ],
  Khulna: [
    "Khulna",
    "Bagerhat",
    "Satkhira",
    "Jashore",
    "Jhenaidah",
    "Magura",
    "Narail",
    "Kushtia",
    "Chuadanga",
    "Meherpur",
  ],
  Barishal: [
    "Barishal",
    "Bhola",
    "Patuakhali",
    "Pirojpur",
    "Barguna",
    "Jhalokati",
  ],
  Sylhet: ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"],
  Rangpur: [
    "Rangpur",
    "Dinajpur",
    "Gaibandha",
    "Kurigram",
    "Lalmonirhat",
    "Nilphamari",
    "Panchagarh",
    "Thakurgaon",
  ],
  Mymensingh: ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"],
};

export const DIVISION_NAMES = Object.keys(BD_DIVISIONS);

export function districtsForDivision(division: string): string[] {
  return BD_DIVISIONS[division] ?? [];
}

export function isValidDivisionDistrict(division: string, district: string): boolean {
  return districtsForDivision(division).includes(district);
}
