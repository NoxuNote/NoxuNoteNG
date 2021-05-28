import { AppConfig } from "../environments/environment";

export function isInDevMode():boolean {
    return !AppConfig.production
}