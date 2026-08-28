export type HouseId = "red" | "green" | "blue" | "yellow";

export type Leader = { name: string; phone: string };

export type House = { id: HouseId; name: string; namesake: string; food: string; themeClass: string; textClass: string; captain: Leader; viceCaptain: Leader };

export type Participant = { id: string; name: string; houseId: HouseId };
