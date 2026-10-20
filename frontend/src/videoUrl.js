
import { API_BASE_URL } from "./api";

// Convert Django media paths into correct URLs
export function getVideoUrl(videoPath) {
  if (!videoPath) {
    return "";
  }

  const path = String(videoPath).trim();

  // Already a complete URL
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  // Relative media URL
  return new URL(
    path.startsWith("/") ? path : `/${path}`,
    `${API_BASE_URL}/`
  ).href;
}
