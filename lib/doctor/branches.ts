/**
 * Oddziały geograficzne placówki (filtr globalny EDM).
 * Nie mylić z jednostkami medycznymi (ortopedia / rehabilitacja) w departmentId wizyty.
 */

export type ClinicBranch = {
  id: string;
  name: string;
  shortName: string;
  address: string;
  city: string;
  phone: string;
  email: string;
};

export const ALL_BRANCHES_ID = "all";

export const CLINIC_BRANCHES: ClinicBranch[] = [
  {
    id: "bialystok",
    name: "Centrum Medyczne Kiryluk & Wenta",
    shortName: "Białystok",
    address: "ul. Szymborskiej 2/U4",
    city: "Białystok",
    phone: "+48 85 652 20 20",
    email: "kontakt@cmkirylukwenta.pl",
  },
  {
    id: "hajnowka",
    name: "Oddział Hajnówka",
    shortName: "Hajnówka",
    address: "ul. Białostocka 12",
    city: "Hajnówka",
    phone: "+48 85 682 11 00",
    email: "hajnowka@cmkirylukwenta.pl",
  },
];

export const BRANCH_STORAGE_KEY = "cmkw-doctor-branch-v1";

export function getBranchById(id: string): ClinicBranch | undefined {
  return CLINIC_BRANCHES.find((b) => b.id === id);
}

export function branchLabel(id: string): string {
  if (id === ALL_BRANCHES_ID) return "Wszystkie oddziały";
  return getBranchById(id)?.shortName ?? id;
}

export function isValidBranchFilter(id: string): boolean {
  return id === ALL_BRANCHES_ID || CLINIC_BRANCHES.some((b) => b.id === id);
}
