export interface Category {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  unit: string;
  available: boolean;
  prepTime: number;
}

export interface Table {
  id: string;
  name: string;
  capacity: number;
  status: "available" | "occupied" | "reserved";
}
