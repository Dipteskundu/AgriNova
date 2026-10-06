/**
 * The dashboard kit — one import line per role dashboard.
 *
 * Every role overview page (farmer, admin, buyer, supplier, inspector,
 * logistics, support) assembles itself from these pieces:
 *
 *   DashboardHero      → the greeting / command banner at the top
 *   DashboardStatGrid  → the four-across KPI row
 *   ServiceGrid        → the sectioned responsive card grid
 *   ServiceInfoModal   → the click-for-details dialog
 *   DashboardSkeleton  → the single loading state
 *   ModalBits          → body primitives for the modal content
 *   useT               → the (bn, en) bilingual helper
 *
 * Types (`ServiceCardItem`, `HeroStatItem`, `StatTile`, `TONE_MAP`) live in
 * `./types` and are re-exported here.
 */
export { DashboardHero } from "./DashboardHero";
export { DashboardStatGrid } from "./DashboardStatGrid";
export { ServiceGrid } from "./ServiceGrid";
export { ServiceCard } from "./ServiceCard";
export { ServiceInfoModal } from "./ServiceInfoModal";
export { DashboardSkeleton } from "./DashboardSkeleton";
export { useT } from "./useT";
export {
  ModalStat,
  ModalRow,
  ModalChip,
  ModalEmpty,
  ModalSyncedNote,
} from "./ModalBits";
export { TONE_MAP, type ServiceCardItem, type HeroStatItem, type StatTile, type ServiceTone } from "./types";
