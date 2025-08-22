import { Zone } from "./ZoneType";

export type Location = {
    id: number;
    zone_id?: number;
    location_name?: string;
    latitude?: string;
    longitude?: string;
    landmark?: string;
    zone?: Zone;
}