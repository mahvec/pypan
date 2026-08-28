import type { House, Participant } from "@/modules/house-reveal/types";

export const HOUSES: House[] = [
  { id: "red", name: "Red House", namesake: "Daniel", food: "Protein", themeClass: "bg-house-red", textClass: "text-white", captain: { name: "Ndifreke Jackson", phone: "08067138085" }, viceCaptain: { name: "Miracle Anyang", phone: "07040860366" } },
  { id: "green", name: "Green House", namesake: "Gideon", food: "Finger Foods (Small Chops / Snacks)", themeClass: "bg-house-green", textClass: "text-white", captain: { name: "Wunisod Efut", phone: "09037620962" }, viceCaptain: { name: "Theresa Ogbuagu", phone: "09137100230" } },
  { id: "blue", name: "Blue House", namesake: "David", food: "Fried Rice", themeClass: "bg-house-blue", textClass: "text-white", captain: { name: "Gerald Ononokpono", phone: "08111112479" }, viceCaptain: { name: "Chidi Obuagu", phone: "08126282344" } },
  { id: "yellow", name: "Yellow House", namesake: "Joseph", food: "Jollof Rice", themeClass: "bg-house-yellow", textClass: "text-house-yellow-ink", captain: { name: "Prince Akuma Uche", phone: "09135340909" }, viceCaptain: { name: "Olaedo Ikwegbu", phone: "08124650785" } },
];

// Preview-only roster until the Convex query layer is connected.
export const PREVIEW_PARTICIPANTS: Participant[] = [
  { id: "1", name: "Adaeze Okoro", houseId: "red" },
  { id: "2", name: "Chukwuemeka Nwosu", houseId: "green" },
  { id: "3", name: "Ebiere Tamuno", houseId: "blue" },
  { id: "4", name: "Ifeoma Obi", houseId: "yellow" },
];
