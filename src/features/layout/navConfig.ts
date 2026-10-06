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
  Heart,
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
    group: 'Farm & Field Infrastructure',
    items: [
      { key: 'farms', label: 'Farm Management', icon: Trees },
      { key: 'fields', label: 'Field Management', icon: Grid3X3 },
    ],
  },
  {
    group: 'Crop Planning & Comparison',
    items: [
      { key: 'recommendation', label: 'Crop Recommendation', icon: Sparkles },
      { key: 'comparison', label: 'Crop Comparison', icon: GitCompare },
    ],
  },
  {
    group: 'Crop Operations & Lifecycle',
    items: [
      { key: 'crops', label: 'Crop Management', icon: Sprout },
      { key: 'logs', label: 'Crop Logs', icon: ClipboardList },
      { key: 'calendar', label: 'Crop Calendar', icon: Calendar },
      { key: 'harvest', label: 'Harvest Management', icon: PackageCheck },
    ],
  },
  {
    group: 'Farm Financials',
    items: [
      { key: 'expenses', label: 'Farm Expenses', icon: Receipt },
      { key: 'profitability', label: 'Profitability', icon: TrendingUp },
    ],
  },
  {
    group: 'Agritech Intelligence & Training',
    items: [
      { key: 'weather', label: 'Weather & Alerts', icon: CloudSun },
      { key: 'training', label: 'Agricultural Training', icon: GraduationCap },
      { key: 'ai_result', label: 'AI Recommendation UI', icon: BrainCircuit },
      { key: 'notifications', label: 'Farmer Notifications', icon: Bell },
    ],
  },
];

// ==========================================
// MARKETPLACE — a feature of the main portal
// ==========================================
//
// These are NOT a portal. The marketplace used to be a fifth portal that
// buyers and suppliers picked at /select-portal; it is now a section of the
// main sidebar that every role in the `main` portal sees, exactly like the
// farm sections a farmer sees. `products` and `inputs` point at the public
// top-level routes rather than dashboard pages, so there is one Products page
// and one Inputs page in the whole application.

export const MAIN_OVERVIEW_GROUP: NavGroup = {
  group: 'Overview',
  items: [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'notifications', label: 'Notifications', icon: Bell },
  ],
};

export const MARKETPLACE_NAV_GROUP: NavGroup = {
  group: 'Marketplace',
  items: [
    { key: 'products', label: 'Products', icon: Store },
    // The buyer's shortlist of produce. Route-only entries exist below
    // (`checkout`, `order_detail`) for pages you must be *led* to; this one
    // earns a sidebar slot because it is a place you return to, not a step in
    // a flow — and every `main`-portal role may keep one, so it sits in the
    // group rather than in a role-specific one.
    { key: 'saved', label: 'Saved', icon: Heart },
    { key: 'inputs', label: 'Inputs', icon: PackageCheck },
    { key: 'cart', label: 'Cart', icon: ShoppingCart },
    { key: 'my_orders', label: 'My Orders', icon: ClipboardList },
    { key: 'demands', label: 'Demand Board', icon: Search },
    { key: 'payments', label: 'Payments', icon: CreditCard },
    { key: 'order_history', label: 'Order History', icon: FileBarChart },
  ],
};

/**
 * Escrow cases the buyer opened. Its own group rather than an item inside
 * Marketplace because it is buyer-only: the API that lists cases scopes to the
 * account that opened them, and a farmer or supplier standing in front of a
 * sidebar entry that 403s would be worse than never having seen one. The admin
 * board shares the URL but keeps its own entry, in its own portal.
 */
export const BUYER_NAV_GROUP: NavGroup = {
  group: 'Cases',
  items: [{ key: 'my_disputes', label: 'Disputes', icon: Scale }],
};

/** Produce listings — anyone who sells on the marketplace, farmer or supplier. */
export const SELLING_GROUP: NavGroup = {
  group: 'Selling',
  items: [
    { key: 'my_listings', label: 'My Listings', icon: Store },
    // Lives here rather than in the farmer-only groups because escrow credits
    // whoever owns the listing — suppliers sell too, and `GET /orders/sales`
    // admits `supplier` for exactly that reason.
    { key: 'sales', label: 'Sales & Wallet', icon: DollarSign },
  ],
};

/** Farm-input stock. Suppliers only: this is what `/inputs` sells. */
export const INVENTORY_GROUP: NavGroup = {
  group: 'My Inputs',
  items: [{ key: 'inventory', label: 'Inventory', icon: PackageCheck }],
};

// ==========================================
// OPERATIONS PORTAL (Inspector + Logistics)
// ==========================================

export const OPERATIONS_NAV_GROUPS: NavGroup[] = [
  {
    group: 'Operations Overview',
    items: [
      { key: 'ops_dashboard', label: 'Operations Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Quality & Inspections',
    items: [
      { key: 'inspections', label: 'Quality Inspections', icon: CheckCircle },
      { key: 'reports', label: 'Inspection Reports', icon: FileBarChart },
    ],
  },
  {
    group: 'Logistics & Delivery',
    items: [
      { key: 'deliveries', label: 'Delivery Tracking', icon: Truck },
      { key: 'fleet', label: 'Fleet Management', icon: PackageCheck },
    ],
  },
  {
    group: 'Account',
    items: [
      { key: 'ops_profile', label: 'Profile', icon: User },
      { key: 'ops_notifications', label: 'Notifications', icon: Bell },
    ],
  },
];

// Inspector-specific nav
export const INSPECTOR_NAV_GROUPS: NavGroup[] = [
  {
    group: 'Inspector Overview',
    items: [
      { key: 'inspector_dashboard', label: 'Inspector Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Inspections',
    items: [
      { key: 'inspections', label: 'Assigned Inspections', icon: CheckCircle },
      { key: 'reports', label: 'Completed Reports', icon: FileBarChart },
    ],
  },
  {
    group: 'Schedule',
    items: [
      { key: 'schedule', label: 'My Schedule', icon: Calendar },
    ],
  },
  {
    group: 'Account',
    items: [
      { key: 'inspector_profile', label: 'Profile', icon: User },
      { key: 'inspector_notifications', label: 'Notifications', icon: Bell },
    ],
  },
];

// Logistics-specific nav
export const LOGISTICS_NAV_GROUPS: NavGroup[] = [
  {
    group: 'Logistics Overview',
    items: [
      { key: 'logistics_dashboard', label: 'Logistics Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Deliveries',
    items: [
      { key: 'deliveries', label: 'Active Deliveries', icon: Truck },
      { key: 'delivery_history', label: 'Delivery History', icon: ClipboardList },
    ],
  },
  {
    group: 'Fleet',
    items: [
      { key: 'fleet', label: 'Fleet Management', icon: PackageCheck },
    ],
  },
  {
    group: 'Earnings',
    items: [
      { key: 'logistics_earnings', label: 'Earnings', icon: CreditCard },
    ],
  },
  {
    group: 'Account',
    items: [
      { key: 'logistics_profile', label: 'Profile', icon: User },
      { key: 'logistics_notifications', label: 'Notifications', icon: Bell },
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
      { key: 'support_dashboard', label: 'Support Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Case Management',
    items: [
      { key: 'disputes', label: 'Disputes', icon: Scale },
      { key: 'help_tickets', label: 'Help Tickets', icon: Phone },
      { key: 'resolution_center', label: 'Resolution Center', icon: Info },
    ],
  },
  {
    group: 'Communication',
    items: [
      { key: 'messages', label: 'Messages', icon: Mail },
      { key: 'escalations', label: 'Escalations', icon: AlertTriangle },
    ],
  },
  {
    group: 'Account',
    items: [
      { key: 'support_profile', label: 'Profile', icon: User },
      { key: 'support_notifications', label: 'Notifications', icon: Bell },
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
      { key: 'admin_dashboard', label: 'Admin Dashboard', icon: ShieldCheck },
      { key: 'user_management', label: 'User Management', icon: Users },
      { key: 'marketplace', label: 'Marketplace Management', icon: Store },
      { key: 'orders', label: 'Orders', icon: ShoppingCart },
      { key: 'payments', label: 'Payments', icon: CreditCard },
      { key: 'quality', label: 'Quality Management', icon: CheckCircle },
      { key: 'logistics', label: 'Logistics', icon: Truck },
      { key: 'training_management', label: 'Training Management', icon: BookOpen },
      { key: 'reports', label: 'Reports', icon: FileBarChart },
      { key: 'disputes', label: 'Disputes', icon: Scale },
    ],
  },
  {
    group: 'DAE Cadastre & Regulatory Tools',
    items: [
      { key: 'farm_verification', label: 'Farm Verification', icon: FileCheck },
      { key: 'crop_catalog', label: 'Master Crop Catalog', icon: Sprout },
      { key: 'advisory_management', label: 'Agronomic Advisory', icon: Send },
      { key: 'market_prices', label: 'Market Price Command', icon: DollarSign },
      { key: 'weather_broadcast', label: 'Weather Broadcast', icon: Radio },
      { key: 'platform_analytics', label: 'Platform Macro Analytics', icon: Terminal },
      { key: 'system_audit', label: 'Security & System Audit', icon: Terminal },
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

/**
 * The `main` portal's own routes — overview only. Everything else is layered
 * on by `resolveRouteMap` according to who is asking.
 */
export const MAIN_ROUTE_MAP: Record<string, string> = {
  dashboard: '/dashboard',
  profile: '/dashboard/profile',
  notifications: '/dashboard/notifications',
};

/**
 * The marketplace feature's routes, shared by every role in the `main`
 * portal. `products` and `inputs` deliberately point outside `/dashboard`:
 * those two pages are public, so they live under the site layout and the
 * sidebar navigates to them rather than duplicating them inside the shell.
 *
 * `order_detail` carries an `:id` segment — `RouteGuard` compiles those into
 * a pattern instead of comparing them literally.
 */
export const MARKETPLACE_ROUTES: Record<string, string> = {
  products: '/products',
  inputs: '/inputs',
  saved: '/dashboard/saved',
  cart: '/dashboard/cart',
  checkout: '/dashboard/checkout',
  my_orders: '/dashboard/orders',
  order_detail: '/dashboard/orders/:id',
  demands: '/dashboard/demands',
  new_demand: '/dashboard/demands/new',
  payments: '/dashboard/payments',
  order_history: '/dashboard/order-history',
};

/** The buyer's own case shelf. See `BUYER_NAV_GROUP` for why it is isolated. */
export const BUYER_ROUTE_MAP: Record<string, string> = {
  my_disputes: '/dashboard/disputes',
};

/** Produce listings. Visible to whoever is allowed to sell. */
export const SELLING_ROUTE_MAP: Record<string, string> = {
  my_listings: '/dashboard/listings',
  // RouteGuard derives its URL allow-list from this map, so a key with no
  // entry here is a page the sidebar can link to but nobody can actually open.
  sales: '/dashboard/sales',
};

/** Farm-input stock — the supplier's half of the Inputs catalogue. */
export const INVENTORY_ROUTE_MAP: Record<string, string> = {
  inventory: '/dashboard/inventory',
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

export const INSPECTOR_ROUTE_MAP: Record<string, string> = {
  inspector_dashboard: '/dashboard',
  inspections: '/dashboard/inspections',
  reports: '/dashboard/reports',
  schedule: '/dashboard/schedule',
  inspector_profile: '/dashboard/profile',
  inspector_notifications: '/dashboard/notifications',
};

export const LOGISTICS_ROUTE_MAP: Record<string, string> = {
  logistics_dashboard: '/dashboard',
  deliveries: '/dashboard/deliveries',
  delivery_history: '/dashboard/history',
  fleet: '/dashboard/fleet',
  logistics_earnings: '/dashboard/earnings',
  logistics_profile: '/dashboard/profile',
  logistics_notifications: '/dashboard/notifications',
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
// CONSOLIDATED MAPS — role-aware
// ==========================================
//
// Navigation and URL validation used to be a `switch (portal)` with one nav
// and one route map per portal. That stopped working once the marketplace
// became a feature rather than a portal: the `main` portal now has to show a
// farmer their crop sections, a supplier their inventory, and everybody the
// marketplace — from one sidebar. So both are *composed* from the caller's
// roles instead of picked.

const has = (roles: string[] | undefined, role: string): boolean =>
  !!roles && roles.includes(role);

/** Groups with the same name are concatenated; duplicate keys are dropped. */
function mergeNavGroups(lists: NavGroup[][]): NavGroup[] {
  const order: string[] = [];
  const byGroup = new Map<string, NavItem[]>();

  for (const list of lists) {
    for (const group of list) {
      if (!byGroup.has(group.group)) {
        byGroup.set(group.group, []);
        order.push(group.group);
      }
      const bucket = byGroup.get(group.group)!;
      for (const item of group.items) {
        if (!bucket.some((existing) => existing.key === item.key)) {
          bucket.push(item);
        }
      }
    }
  }

  return order.map((name) => ({ group: name, items: byGroup.get(name)! }));
}

/** `main` portal: overview + marketplace for everyone, work sections by role. */
function mainNavGroups(roles: string[] = []): NavGroup[] {
  const groups: NavGroup[] = [MAIN_OVERVIEW_GROUP, MARKETPLACE_NAV_GROUP];

  if (has(roles, 'farmer') || has(roles, 'supplier')) groups.push(SELLING_GROUP);
  if (has(roles, 'supplier')) groups.push(INVENTORY_GROUP);
  if (has(roles, 'farmer')) groups.push(...FARMER_NAV_GROUPS);
  if (has(roles, 'buyer')) groups.push(BUYER_NAV_GROUP);

  return groups;
}

/** `operations`: the inspector's, the logistics officer's, or the shared one. */
function operationsNavGroups(roles: string[] = []): NavGroup[] {
  const isInspector = has(roles, 'inspector');
  const isLogistics = has(roles, 'logistics');

  if (isInspector && isLogistics) {
    return mergeNavGroups([INSPECTOR_NAV_GROUPS, LOGISTICS_NAV_GROUPS]);
  }
  if (isInspector) return INSPECTOR_NAV_GROUPS;
  if (isLogistics) return LOGISTICS_NAV_GROUPS;
  return OPERATIONS_NAV_GROUPS;
}

function mainRouteMap(roles: string[] = []): Record<string, string> {
  const map: Record<string, string> = { ...MAIN_ROUTE_MAP, ...MARKETPLACE_ROUTES };

  if (has(roles, 'farmer') || has(roles, 'supplier')) {
    Object.assign(map, SELLING_ROUTE_MAP);
  }
  if (has(roles, 'supplier')) Object.assign(map, INVENTORY_ROUTE_MAP);
  if (has(roles, 'farmer')) Object.assign(map, FARMER_ROUTE_MAP);
  if (has(roles, 'buyer')) Object.assign(map, BUYER_ROUTE_MAP);

  return map;
}

function operationsRouteMap(roles: string[] = []): Record<string, string> {
  const isInspector = has(roles, 'inspector');
  const isLogistics = has(roles, 'logistics');

  if (isInspector && isLogistics) {
    return { ...OPERATIONS_ROUTE_MAP, ...INSPECTOR_ROUTE_MAP, ...LOGISTICS_ROUTE_MAP };
  }
  if (isInspector) return { ...INSPECTOR_ROUTE_MAP };
  if (isLogistics) return { ...LOGISTICS_ROUTE_MAP };
  return { ...OPERATIONS_ROUTE_MAP };
}

/** The sidebar a given portal shows this particular user. */
export function getNavGroups(portal: PortalType, roles?: string[]): NavGroup[] {
  switch (portal) {
    case 'main':
      return mainNavGroups(roles);
    case 'operations':
      return operationsNavGroups(roles);
    case 'support':
      return SUPPORT_NAV_GROUPS;
    case 'admin':
      return ADMIN_NAV_GROUPS;
    default:
      return mainNavGroups(roles);
  }
}

/**
 * The URLs this user is allowed to visit on this portal. `RouteGuard`
 * validates against this, so it has to move with the nav — a buyer must be
 * allowed onto `/dashboard/demands` because their sidebar offers it, while a
 * farmer with no crops section must not be able to wander into `/dashboard/farms`.
 */
export function resolveRouteMap(
  portal: PortalType,
  roles?: string[]
): Record<string, string> {
  switch (portal) {
    case 'main':
      return mainRouteMap(roles);
    case 'operations':
      return operationsRouteMap(roles);
    case 'support':
      return { ...SUPPORT_ROUTE_MAP };
    case 'admin':
      return { ...ADMIN_ROUTE_MAP };
    default:
      return mainRouteMap(roles);
  }
}

export function getRoute(
  portal: PortalType,
  moduleKey: string,
  roles?: string[]
): string {
  return resolveRouteMap(portal, roles)[moduleKey] ?? '/dashboard';
}

/** `/dashboard/orders/:id` → matches `/dashboard/orders/AG-ORD-26-117`. */
export function matchesPattern(pattern: string, pathname: string): boolean {
  if (!pattern.includes(':')) return pattern === pathname;
  const source = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/:[A-Za-z]+/g, '[^/]+');
  return new RegExp(`^${source}$`).test(pathname);
}

/**
 * Is this URL part of this user's portal? `RouteGuard` uses it to bounce
 * someone who typed a route their sidebar does not offer — e.g. a buyer
 * walking into `/dashboard/farms`.
 */
export function isRouteAllowed(
  portal: PortalType,
  pathname: string,
  roles?: string[]
): boolean {
  return Object.values(resolveRouteMap(portal, roles)).some((route) =>
    matchesPattern(route, pathname)
  );
}

/**
 * Which sidebar item lights up for this URL.
 *
 * Exact routes win over `:id` patterns so `/dashboard/orders` never resolves
 * to the detail entry, and `/dashboard` itself resolves to `dashboard` rather
 * than whichever key the role's map happens to list first.
 */
export function getActiveKey(
  portal: PortalType,
  pathname: string,
  roles?: string[]
): string {
  const entries = Object.entries(resolveRouteMap(portal, roles));

  const exact = entries.find(([, route]) => !route.includes(':') && route === pathname);
  if (exact) return exact[0];

  const patterned = entries.find(([, route]) => matchesPattern(route, pathname));
  if (patterned) return patterned[0];

  return 'dashboard';
}
