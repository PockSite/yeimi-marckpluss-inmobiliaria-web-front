export interface PaginatedResponse<T> {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
  data: T[];
}

export interface Property {
  idpro: number;
  codpro: number;
  reference: string;
  branch: number;

  address: string;
  city: string;
  city_code: number;

  zone: string;
  zone_code: number;

  city_zone: string;
  city_zone_code: number;

  neighborhood: string;
  neighborhood_code: number;

  type: string;
  type_code: number;

  biz: string;
  biz_code: number;

  area_cons: number;
  area_lot: number;

  bedrooms: number;
  bathrooms: number;

  price: string;
  price_format: string;
  rent: number;
  saleprice: number;
  administration: number;

  latitude: string;
  longitude: string;

  description: string;
  english_description: string;

  parking: number;
  parking_covered: number;

  consignation_date: string;
  registry_date: string;
  updated_at: string;
  status_changed_at: string;

  real_state: number;
  real_state_name: string;
  real_state_logo: string;

  build_year: number;
  status: number;

  comment: string;
  comment2: string;
  great: string;
  vip: boolean;

  video: string;
  detached_count: number;
  iva: number;
  price_iva: number;

  tour3d: string;

  images_count: number;
  images360_count: number;

  proyect_id: number;
  stratum: number;

  image1: string;
  image1_wm: string;
  image2: string;
  image2_wm: string;
  image3: string;
  image3_wm: string;
}