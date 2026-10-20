
const API_BASE_URL = import.meta.env.VITE_API_URL;
// ========================================
// LOGOUT
// ========================================

function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");

  window.location.replace("/login");
}

// ========================================
// BUILD REQUEST HEADERS
// ========================================

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

// ========================================
// API FETCH WITH JWT REFRESH
// ========================================

export async function apiFetch(url, options = {}) {
  let accessToken = localStorage.getItem("access_token");

  const endpoint = url.startsWith("/")
    ? url
    : `/${url}`;

  const requestUrl = `${API_BASE_URL}${endpoint}`;

  // First request
  let response = await fetch(requestUrl, {
    ...options,
    headers: buildHeaders(options, accessToken),
  });

  // Access token expired or invalid
  if (response.status !== 401) {
    return response;
  }

  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) {
    logout();
    return response;
  }

  // Request new access token
  const refreshResponse = await fetch(
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

  if (!refreshResponse.ok) {
    logout();
    return response;
  }

  const refreshData = await refreshResponse.json();

  if (!refreshData.access) {
    logout();
    return response;
  }

  // Save new access token
  accessToken = refreshData.access;

  localStorage.setItem("access_token", accessToken);

  if (refreshData.refresh) {
    localStorage.setItem(
      "refresh_token",
      refreshData.refresh
    );
  }

  // Retry original request
  response = await fetch(requestUrl, {
    ...options,
    headers: buildHeaders(options, accessToken),
  });

  if (response.status === 401) {
    logout();
  }

  return response;
}
