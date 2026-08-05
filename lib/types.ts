export type ProductWithBrand = {
  id: number;
  slug: string;
  name: string;
  model: string;
  brand: { name: string } | null;
  image_url?: string | null;
  manufacturer_url?: string | null;
  suitable_for?: string[] | null;
  pros?: string[] | null;
  cons?: string[] | null;
  specifications: {
    extraction_litres_per_day?: number | null;
    noise_db?: number | null;
    power_watts?: number | null;
    tank_capacity_litres?: number | null;
    dehumidifier_type?: string | null;
    laundry_mode?: boolean | null;
    continuous_drainage?: boolean | null;
    humidistat?: boolean | null;
    air_purification?: boolean | null;
    weight_kg?: number | null;
    width_mm?: number | null;
    height_mm?: number | null;
    depth_mm?: number | null;
  } | null;
};
