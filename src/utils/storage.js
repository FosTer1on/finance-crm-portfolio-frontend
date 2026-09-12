const STORAGE_KEYS = {
  ACCESS_TOKEN: "finance_crm_access_token",
  REFRESH_TOKEN: "finance_crm_refresh_token",
};

export const authStorage = {
  getAccessToken() {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  getRefreshToken() {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  setTokens({ access, refresh }) {
    if (access) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access);
    }

    if (refresh) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh);
    }
  },

  setAccessToken(access) {
    if (!access) {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      return;
    }

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access);
  },

  clear() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);

    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },
};
