const API_BASE_URL = "http://localhost:8000";


// ========================================
// API FETCH
// ========================================

export async function apiFetch(url, options = {}) {

    let accessToken =
        localStorage.getItem("access_token");


    // ========================================
    // FIRST REQUEST
    // ========================================

    let response = await fetch(
        `${API_BASE_URL}${url}`,
        {
            ...options,

            headers: {
                ...options.headers,

                Authorization:
                    `Bearer ${accessToken}`,
            },
        }
    );


    // ========================================
    // ACCESS TOKEN EXPIRED
    // ========================================

    if (response.status === 401) {

        const refreshToken =
            localStorage.getItem("refresh_token");


        // ========================================
        // NO REFRESH TOKEN
        // ========================================

        if (!refreshToken) {

            logout();

            return response;
        }


        // ========================================
        // REQUEST NEW ACCESS TOKEN
        // ========================================

        const refreshResponse =
            await fetch(
                `${API_BASE_URL}/token/refresh/`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        refresh: refreshToken,
                    }),
                }
            );


        // ========================================
        // REFRESH TOKEN EXPIRED
        // ========================================

        if (!refreshResponse.ok) {

            logout();

            return response;
        }


        const refreshData =
            await refreshResponse.json();


        // ========================================
        // SAVE NEW ACCESS TOKEN
        // ========================================

        localStorage.setItem(
            "access_token",
            refreshData.access
        );


        accessToken =
            refreshData.access;


        // ========================================
        // RETRY ORIGINAL REQUEST
        // ========================================

        response = await fetch(
            `${API_BASE_URL}${url}`,
            {
                ...options,

                headers: {
                    ...options.headers,

                    Authorization:
                        `Bearer ${accessToken}`,
                },
            }
        );
    }


    return response;
}


// ========================================
// LOGOUT
// ========================================

function logout() {

    localStorage.removeItem(
        "access_token"
    );

    localStorage.removeItem(
        "refresh_token"
    );

    localStorage.removeItem(
        "user"
    );

    window.location.href = "/login";
}