import { IconType } from "react-icons";
import {
  FcBookmark,
  FcEngineering,
  FcFilmReel,
  FcMultipleDevices,
  FcMusic,
  FcOldTimeCamera,
  FcSalesPerformance,
  FcSportsMode,
} from "react-icons/fc";

/** Icons for seeded categories; unknown categories fall back to a bookmark. */
const iconMap: Record<string, IconType> = {
  "Music": FcMusic,
  "Photography": FcOldTimeCamera,
  "Fitness": FcSportsMode,
  "Accounting": FcSalesPerformance,
  "Computer Science": FcMultipleDevices,
  "Filming": FcFilmReel,
  "Engineering": FcEngineering,
};

export const categoryIcon = (name: string): IconType => iconMap[name] ?? FcBookmark;
