export { AgriPortalShell } from './AppShell';
export { RouteGuard } from './RouteGuard';
export {
  FARMER_ROUTE_MAP,
  ADMIN_ROUTE_MAP,
  getRoute,
  getActiveKey,
  getNavGroups,
} from './navConfig';
export type { NavItem, NavGroup } from './navConfig';

// Legacy type aliases for feature components that still import these
export type FarmerModuleKey = string;
export type AdminModuleKey = string;
