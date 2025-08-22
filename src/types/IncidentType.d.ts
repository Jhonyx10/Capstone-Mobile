import { Category } from "./CategoryType";

export type IncidentType = {
    id: number;
    category_id: number;
    incident_name: string;
    category?: Category;
    };