import type { Department } from "@/lib/doctor/types";

export const departments: Department[] = [
  {
    id: "ortopedia",
    name: "Ortopedia i traumatologia",
    shortName: "Ortopedia",
  },
  {
    id: "rehabilitacja",
    name: "Fizjoterapia i rehabilitacja",
    shortName: "Rehabilitacja",
  },
  {
    id: "poradnia",
    name: "Poradnia specjalistyczna",
    shortName: "Poradnia",
  },
];

export function getDepartmentById(id: string): Department | undefined {
  return departments.find((d) => d.id === id);
}
