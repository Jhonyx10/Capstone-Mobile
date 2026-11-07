import getRequestResponse from './useRequestResponse';
import {
  distanceMeters,
  GEOFENCE_RADIUS_M,
  LngLat,
} from '../../util/geofence';

/**
 * The one place that knows how a request stores its category.
 * Adjust this to match your API response.
 */
export const getRequestCategoryId = (r: any): string | null => {
  const id = r?.category_id ?? r?.category?.id ?? r?.incident_category_id;
  return id == null ? null : String(id);
};

/** Latitude/longitude may arrive as strings (e.g. Laravel decimals). */
export const getRequestCoords = (r: any): LngLat | null => {
  const lng = Number(r?.longitude);
  const lat = Number(r?.latitude);
  return Number.isFinite(lng) && Number.isFinite(lat) ? [lng, lat] : null;
};

const useDuplicateRequest = () => {
  const query: any = getRequestResponse();

  /**
   * Returns the existing request that blocks this one, or null.
   * Blocks only when the user is inside the geofence AND the category matches.
   */
  const findDuplicate = async (
    userCoords: LngLat,
    categoryId: string | number | null | undefined,
  ) => {
    if (categoryId == null) return null;

    // use the freshest list so a request filed seconds ago still counts
    let list: any[] = Array.isArray(query.data) ? query.data : [];
    try {
      const res = await query.refetch?.();
      if (Array.isArray(res?.data)) list = res.data;
    } catch {
      // offline or failed: fall back to the cached list
    }

    return (
      list.find(r => {
        const coords = getRequestCoords(r);
        if (!coords) return false;
        if (distanceMeters(userCoords, coords) > GEOFENCE_RADIUS_M) return false;
        return getRequestCategoryId(r) === String(categoryId);
      }) ?? null
    );
  };

  return { findDuplicate };
};

export default useDuplicateRequest;