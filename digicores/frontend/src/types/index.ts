export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export interface QuantityTier {
  quantity: number;
  price: number;
}

export interface UnitOption {
  label: string;
  price: number;
}

export interface SizeConfig {
  unit: string;
  price_per_unit: number;
  min_units: number;
}

export type PricingConfig =
  | { tiers: QuantityTier[] }
  | { options: UnitOption[] }
  | SizeConfig;

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  category_id: number;
  category_name: string;
  category_slug: string;
  product_type: 'quantity_based' | 'size_based' | 'unit_based';
  pricing_config: PricingConfig;
  image_url: string;
  active: boolean;
  min_price: number;
  created_at: string;
  updated_at: string;
}

export interface PriceResult {
  price: number;
  details: string;
  product_name: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}
