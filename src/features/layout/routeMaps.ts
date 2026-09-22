export type FarmerModuleKey =
  | 'dashboard'
  | 'profile'
  | 'farms'
  | 'fields'
  | 'recommendation'
  | 'comparison'
  | 'crops'
  | 'logs'
  | 'calendar'
  | 'harvest'
  | 'expenses'
  | 'profitability'
  | 'weather'
  | 'training'
  | 'ai_result'
  | 'notifications';

export type AdminModuleKey =
  | 'admin_dashboard'
  | 'user_management'
  | 'marketplace'
  | 'orders'
  | 'payments'
  | 'quality'
  | 'logistics'
  | 'training_management'
  | 'reports'
  | 'disputes'
  | 'farm_verification'
  | 'crop_catalog'
  | 'advisory_management'
  | 'market_prices'
  | 'weather_broadcast'
  | 'platform_analytics'
  | 'system_audit';

export const FARMER_ROUTE_MAP: Record<FarmerModuleKey, string> = {
  dashboard: "/farmer",
  profile: "/farmer/profile",
  farms: "/farmer/farm",
  fields: "/farmer/fields",
  recommendation: "/farmer/crops/recommend",
  comparison: "/farmer/comparison",
  crops: "/farmer/crops",
  logs: "/farmer/logs",
  calendar: "/farmer/calendar",
  harvest: "/farmer/harvest",
  expenses: "/farmer/expenses",
  profitability: "/farmer/profitability",
  weather: "/farmer/weather",
  training: "/farmer/training",
  ai_result: "/farmer/crops/recommend/result",
  notifications: "/farmer/notifications",
};

export const ADMIN_ROUTE_MAP: Record<AdminModuleKey, string> = {
  admin_dashboard: "/admin",
  user_management: "/admin/users",
  marketplace: "/admin/marketplace",
  orders: "/admin/orders",
  payments: "/admin/payments",
  quality: "/admin/quality",
  logistics: "/admin/logistics",
  training_management: "/admin/training",
  reports: "/admin/reports",
  disputes: "/admin/disputes",
  farm_verification: "/admin/farm-verification",
  crop_catalog: "/admin/crop-catalog",
  advisory_management: "/admin/advisory",
  market_prices: "/admin/market-prices",
  weather_broadcast: "/admin/weather-alerts",
  platform_analytics: "/admin/analytics",
  system_audit: "/admin/audit-logs",
};

const FARMER_PATH_ORDER: Array<[FarmerModuleKey, string]> = [
  ["ai_result", "/farmer/crops/recommend/result"],
  ["recommendation", "/farmer/crops/recommend"],
  ...(Object.entries(FARMER_ROUTE_MAP) as Array<[FarmerModuleKey, string]>),
];

export function farmerActiveKey(pathname: string): FarmerModuleKey {
  const found = FARMER_PATH_ORDER.find(([, route]) => pathname === route);
  return found ? found[0] : "dashboard";
}

export function adminActiveKey(pathname: string): AdminModuleKey {
  const found = Object.entries(ADMIN_ROUTE_MAP).find(([, route]) => pathname === route);
  return found ? (found[0] as AdminModuleKey) : "admin_dashboard";
}