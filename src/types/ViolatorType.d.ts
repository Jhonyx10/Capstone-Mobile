import { Zone } from "./ZoneType";

export type Violator = {
    id: number;
    last_name?: string;
    first_name?: string;
    age?: number;
    zone_id?: number;
    address?: string;
    photo?: string | null;
    zone?: Zone;
}

export type CreateViolator = Omit<Violator, "id">;