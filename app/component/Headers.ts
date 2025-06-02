import { Config } from "../config";

export function getAuthHeaders() {
  const token = localStorage.getItem(Config.tokenName);

  return {
    Authorization: `Bearer ${token}`,
  };
}
