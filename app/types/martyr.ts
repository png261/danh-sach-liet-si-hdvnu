// Shared Martyr type used across the application
export interface Martyr {
  id: string;
  name: string;
  birth_year: string;
  enlistment_date: string;
  hometown: string;
  death_date: string;
  rank: string;
  unit: string;
  raw_info: string;
  is_unknown: boolean;
  cemetery: string;
  source_file: string;
  grave_no: string;
  row_no: string;
  zone: string;
  lot: string;
  relics: string;
  gather_location: string;
  gather_unit: string;
  move_location: string;
  move_person: string;
  notes: string;
}
