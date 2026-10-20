
const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000"
).replace(/\/+$/, "");

// Logout
function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");

  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}

// Build headers
function buildHeaders(options, token) {
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

// Shared refresh request
let refreshPromise = null;

async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken =
      localStorage.getItem("refresh_token");

    if (!refreshToken) {
      return null;
    }

    const response = await fetch(
      `${API_BASE_URL}/token/refresh/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.access) {
      return null;
    }

    localStorage.setItem(
      "access_token",
      data.access
    );

    if (data.refresh) {
      localStorage.setItem(
        "refresh_token",
        data.refresh
      );
    }

    return data.access;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

// API fetch
export async function apiFetch(endpoint, options = {}) {
  const path = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const url = `${API_BASE_URL}${path}`;

  let token =
    localStorage.getItem("access_token");

  let response = await fetch(url, {
    ...options,
    headers: buildHeaders(options, token),
  });

  if (response.status !== 401) {
    return response;
  }

  try {
    token = await refreshAccessToken();
  } catch (error) {
    console.error("Token refresh failed:", error);
    token = null;
  }

  if (!token) {
    logout();
    return response;
  }

  response = await fetch(url, {
    ...options,
    headers: buildHeaders(options, token),
  });

  if (response.status === 401) {
    logout();
  }

  return response;
}

export { API_BASE_URL };
