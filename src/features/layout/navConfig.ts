import { PortalType } from '@/types';
import {
  LayoutDashboard,
  User,
  Trees,
  Grid3X3,
  Sparkles,
  GitCompare,
  Sprout,
  ClipboardList,
  Calendar,
  PackageCheck,
  Receipt,
  TrendingUp,
  CloudSun,
  GraduationCap,
  BrainCircuit,
  Bell,
  ShieldCheck,
  Users,
  Store,
  ShoppingCart,
  CreditCard,
  CheckCircle,
  Truck,
  BookOpen,
  FileBarChart,
  Scale,
  FileCheck,
  Send,
  DollarSign,
  Radio,
  Terminal,
  Search,
  Phone,
  Mail,
  Info,
  AlertTriangle,
  BarChart3,
} from '@/components/icons';

export interface NavItem {
  key: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

// ==========================================
// FARMER PORTAL
// ==========================================

export const FARMER_NAV_GROUPS: NavGroup[] = [
  {
    group: 'Overview & Profile',
    items: [
      { key: 'dashboard', label: '1. Farmer Dashboard', icon: LayoutDashboard },
      { key: 'profile', label: '2. Profile', icon: User },
    ],
  },
  {
    group: 'Farm & Field Infrastructure',
    items: [
      { key: 'farms', label: '3. Farm Management', icon: Trees },
      { key: 'fields', label: '4. Field Management', icon: Grid3X3 },
    ],
  },
  {
    group: 'Crop Planning & Comparison',
    items: [
      { key: 'recommendation', label: '5. Crop Recommendation', icon: Sparkles },
      { key: 'comparison', label: '6. Crop Comparison', icon: GitCompare },
    ],
  },
  {
    group: 'Crop Operations & Lifecycle',
    items: [
      { key: 'crops', label: '7. Crop Management', icon: Sprout },
      { key: 'logs', label: '8. Crop Logs', icon: ClipboardList },
      { key: 'calendar', label: '9. Crop Calendar', icon: Calendar },
      { key: 'harvest', label: '10. Harvest Management', icon: PackageCheck },
    ],
  },
  {
    group: 'Farm Financials',
    items: [
      { key: 'expenses', label: '11. Farm Expenses', icon: Receipt },
      { key: 'profitability', label: '12. Profitability', icon: TrendingUp },
    ],
  },
  {
    group: 'Agritech Intelligence & Training',
    items: [
      { key: 'weather', label: '13. Weather & Alerts', icon: CloudSun },
      { key: 'training', label: '14. Agricultural Training', icon: GraduationCap },
      { key: 'ai_result', label: '15. AI Recommendation UI', icon: BrainCircuit },
      { key: 'notifications', label: '16. Farmer Notifications', icon: Bell },
    ],
  },
];

// ==========================================
// MARKETPLACE PORTAL (Buyer + Supplier)
// ==========================================

export const MARKETPLACE_NAV_GROUPS: NavGroup[] = [
  {
    group: 'Marketplace Overview',
    items: [
      { key: 'marketplace_dashboard', label: '1. Marketplace Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Buying & Selling',
    items: [
      { key: 'browse_produce', label: '2. Browse Produce', icon: Search },
      { key: 'my_orders', label: '3. My Orders', icon: ShoppingCart },
      { key: 'my_listings', label: '4. My Listings', icon: Store },
    ],
  },
  {
    group: 'Payments & Transactions',
    items: [
      { key: 'payments', label: '5. Payments', icon: CreditCard },
      { key: 'order_history', label: '6. Order History', icon: ClipboardList },
    ],
  },
  {
    group: 'Account',
    items: [
      { key: 'marketplace_profile', label: '7. Profile', icon: User },
      { key: 'marketplace_notifications', label: '8. Notifications', icon: Bell },
    ],
  },
];

// ==========================================
// OPERATIONS PORTAL (Inspector + Logistics)
// ==========================================

export const OPERATIONS_NAV_GROUPS: NavGroup[] = [
  {
    group: 'Operations Overview',
    items: [
      { key: 'ops_dashboard', label: '1. Operations Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Quality & Inspections',
    items: [
      { key: 'inspections', label: '2. Quality Inspections', icon: CheckCircle },
      { key: 'reports', label: '3. Inspection Reports', icon: FileBarChart },
    ],
  },
  {
    group: 'Logistics & Delivery',
    items: [
      { key: 'deliveries', label: '4. Delivery Tracking', icon: Truck },
      { key: 'fleet', label: '5. Fleet Management', icon: PackageCheck },
    ],
  },
  {
    group: 'Account',
    items: [
      { key: 'ops_profile', label: '6. Profile', icon: User },
      { key: 'ops_notifications', label: '7. Notifications', icon: Bell },
    ],
  },
];

// ==========================================
// SUPPORT PORTAL
// ==========================================

export const SUPPORT_NAV_GROUPS: NavGroup[] = [
  {
    group: 'Support Overview',
    items: [
      { key: 'support_dashboard', label: '1. Support Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Case Management',
    items: [
      { key: 'disputes', label: '2. Disputes', icon: Scale },
      { key: 'help_tickets', label: '3. Help Tickets', icon: Phone },
      { key: 'resolution_center', label: '4. Resolution Center', icon: Info },
    ],
  },
  {
    group: 'Communication',
    items: [
      { key: 'messages', label: '5. Messages', icon: Mail },
      { key: 'escalations', label: '6. Escalations', icon: AlertTriangle },
    ],
  },
  {
    group: 'Account',
    items: [
      { key: 'support_profile', label: '7. Profile', icon: User },
      { key: 'support_notifications', label: '8. Notifications', icon: Bell },
    ],
  },
];

// ==========================================
// ADMIN PORTAL
// ==========================================

export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    group: 'Admin Core Portal (10 Modules)',
    items: [
      { key: 'admin_dashboard', label: '1. Admin Dashboard', icon: ShieldCheck },
      { key: 'user_management', label: '2. User Management', icon: Users },
      { key: 'marketplace', label: '3. Marketplace Management', icon: Store },
      { key: 'orders', label: '4. Orders', icon: ShoppingCart },
      { key: 'payments', label: '5. Payments', icon: CreditCard },
      { key: 'quality', label: '6. Quality Management', icon: CheckCircle },
      { key: 'logistics', label: '7. Logistics', icon: Truck },
      { key: 'training_management', label: '8. Training Management', icon: BookOpen },
      { key: 'reports', label: '9. Reports', icon: FileBarChart },
      { key: 'disputes', label: '10. Disputes', icon: Scale },
    ],
  },
  {
    group: 'DAE Cadastre & Regulatory Tools',
    items: [
      { key: 'farm_verification', label: '11. Farm Verification', icon: FileCheck },
      { key: 'crop_catalog', label: '12. Master Crop Catalog', icon: Sprout },
      { key: 'advisory_management', label: '13. Agronomic Advisory', icon: Send },
      { key: 'market_prices', label: '14. Market Price Command', icon: DollarSign },
      { key: 'weather_broadcast', label: '15. Weather Broadcast', icon: Radio },
      { key: 'platform_analytics', label: '16. Platform Macro Analytics', icon: Terminal },
      { key: 'system_audit', label: '17. Security & System Audit', icon: Terminal },
    ],
  },
];

// ==========================================
// ROUTE MAPS
// ==========================================

export const FARMER_ROUTE_MAP: Record<string, string> = {
  dashboard: '/dashboard',
  profile: '/dashboard/profile',
  farms: '/dashboard/farms',
  fields: '/dashboard/fields',
  recommendation: '/dashboard/crops/recommend',
  comparison: '/dashboard/comparison',
  crops: '/dashboard/crops',
  logs: '/dashboard/logs',
  calendar: '/dashboard/calendar',
  harvest: '/dashboard/harvest',
  expenses: '/dashboard/expenses',
  profitability: '/dashboard/profitability',
  weather: '/dashboard/weather',
  training: '/dashboard/training',
  ai_result: '/dashboard/crops/recommend/result',
  notifications: '/dashboard/notifications',
};

export const MARKETPLACE_ROUTE_MAP: Record<string, string> = {
  marketplace_dashboard: '/dashboard',
  browse_produce: '/dashboard/browse',
  my_orders: '/dashboard/orders',
  my_listings: '/dashboard/listings',
  payments: '/dashboard/payments',
  order_history: '/dashboard/order-history',
  marketplace_profile: '/dashboard/profile',
  marketplace_notifications: '/dashboard/notifications',
};

export const OPERATIONS_ROUTE_MAP: Record<string, string> = {
  ops_dashboard: '/dashboard',
  inspections: '/dashboard/inspections',
  reports: '/dashboard/reports',
  deliveries: '/dashboard/deliveries',
  fleet: '/dashboard/fleet',
  ops_profile: '/dashboard/profile',
  ops_notifications: '/dashboard/notifications',
};

export const SUPPORT_ROUTE_MAP: Record<string, string> = {
  support_dashboard: '/dashboard',
  disputes: '/dashboard/disputes',
  help_tickets: '/dashboard/tickets',
  resolution_center: '/dashboard/resolutions',
  messages: '/dashboard/messages',
  escalations: '/dashboard/escalations',
  support_profile: '/dashboard/profile',
  support_notifications: '/dashboard/notifications',
};

export const ADMIN_ROUTE_MAP: Record<string, string> = {
  admin_dashboard: '/dashboard',
  user_management: '/dashboard/users',
  marketplace: '/dashboard/marketplace',
  orders: '/dashboard/orders',
  payments: '/dashboard/payments',
  quality: '/dashboard/quality',
  logistics: '/dashboard/logistics',
  training_management: '/dashboard/training-mgmt',
  reports: '/dashboard/reports',
  disputes: '/dashboard/disputes',
  farm_verification: '/dashboard/farm-verification',
  crop_catalog: '/dashboard/crop-catalog',
  advisory_management: '/dashboard/advisory',
  market_prices: '/dashboard/market-prices',
  weather_broadcast: '/dashboard/weather-broadcast',
  platform_analytics: '/dashboard/analytics',
  system_audit: '/dashboard/audit-logs',
};

// ==========================================
// CONSOLIDATED MAPS
// ==========================================

export const ROUTE_MAP: Record<PortalType, Record<string, string>> = {
  farmer: FARMER_ROUTE_MAP,
  marketplace: MARKETPLACE_ROUTE_MAP,
  operations: OPERATIONS_ROUTE_MAP,
  support: SUPPORT_ROUTE_MAP,
  admin: ADMIN_ROUTE_MAP,
};

export function getNavGroups(portal: PortalType): NavGroup[] {
  switch (portal) {
    case 'farmer':
      return FARMER_NAV_GROUPS;
    case 'marketplace':
      return MARKETPLACE_NAV_GROUPS;
    case 'operations':
      return OPERATIONS_NAV_GROUPS;
    case 'support':
      return SUPPORT_NAV_GROUPS;
    case 'admin':
      return ADMIN_NAV_GROUPS;
    default:
      return FARMER_NAV_GROUPS;
  }
}

export function getRoute(portal: PortalType, moduleKey: string): string {
  const map = ROUTE_MAP[portal];
  return map?.[moduleKey] ?? '/dashboard';
}

const FARMER_PATH_ORDER: Array<[string, string]> = [
  ['ai_result', '/dashboard/crops/recommend/result'],
  ['recommendation', '/dashboard/crops/recommend'],
  ...Object.entries(FARMER_ROUTE_MAP),
];

const MARKETPLACE_PATH_ORDER: Array<[string, string]> = [
  ...Object.entries(MARKETPLACE_ROUTE_MAP),
];

const OPERATIONS_PATH_ORDER: Array<[string, string]> = [
  ...Object.entries(OPERATIONS_ROUTE_MAP),
];

const SUPPORT_PATH_ORDER: Array<[string, string]> = [
  ...Object.entries(SUPPORT_ROUTE_MAP),
];

export function getActiveKey(portal: PortalType, pathname: string): string {
  let pathOrder: Array<[string, string]>;

  switch (portal) {
    case 'marketplace':
      pathOrder = MARKETPLACE_PATH_ORDER;
      break;
    case 'operations':
      pathOrder = OPERATIONS_PATH_ORDER;
      break;
    case 'support':
      pathOrder = SUPPORT_PATH_ORDER;
      break;
    case 'admin':
      return (
        Object.entries(ADMIN_ROUTE_MAP).find(([, route]) => pathname === route)?.[0] ??
        'admin_dashboard'
      );
    default:
      pathOrder = FARMER_PATH_ORDER;
  }

  const found = pathOrder.find(([, route]) => pathname === route);
  return found ? found[0] : pathOrder[0]?.[0] ?? 'dashboard';
}
