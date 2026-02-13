export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  department: string;
  joinDate: string;
  activityScore: number;
}

export type SortField = 'name' | 'email' | 'age' | 'activityScore';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface FiltersState {
  search: string;
  department: string;
}
