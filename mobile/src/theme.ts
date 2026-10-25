export const colors = {
  ink: "#15383b",
  inkSoft: "#486366",
  teal: "#318b8e",
  tealDeep: "#17494c",
  mint: "#eaf5f3",
  paper: "#f4f8f7",
  white: "#ffffff",
  plum: "#7d3865",
  plumSoft: "#f5edf3",
  border: "#dce8e6",
  muted: "#819493",
  danger: "#a33945",
  success: "#247d66",
  amber: "#a67524",
};

export const businessTypes = [
  { value: "cafe", label: "Cafetería" },
  { value: "restaurant", label: "Restaurante" },
  { value: "bakery", label: "Panadería" },
  { value: "pharmacy", label: "Farmacia" },
  { value: "gym", label: "Gimnasio" },
  { value: "supermarket", label: "Supermercado" },
] as const;

export type BusinessType = (typeof businessTypes)[number]["value"];

export function businessLabel(type: BusinessType): string {
  return businessTypes.find((item) => item.value === type)?.label ?? type;
}
