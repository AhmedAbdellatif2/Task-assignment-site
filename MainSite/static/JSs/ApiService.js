class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

class ApiService {
  constructor() {
    this.baseUrl = "http://127.0.0.1:8000";
    this.token = localStorage.getItem("authToken");
    this.maxRetries = 3;
    this.retryDelay = 1000;
    this.requestQueue = [];
    this.isProcessingQueue = false;
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Setup offline detection
    window.addEventListener("online", () => this.processRequestQueue());
    window.addEventListener("offline", () => {
      console.log("Application is offline. Requests will be queued.");
    });
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem("authToken", token);
      // Update token expiry
      const tokenData = this.parseJwt(token);
      if (tokenData.exp) {
        this.setupTokenRefresh(tokenData.exp);
      }
    } else {
      localStorage.removeItem("authToken");
    }
  }

  parseJwt(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(window.atob(base64));
    } catch (error) {
      console.error("Error parsing JWT:", error);
      return {};
    }
  }

  setupTokenRefresh(expiryTimestamp) {
    const refreshBuffer = 5 * 60 * 1000;
    const timeUntilRefresh =
      expiryTimestamp * 1000 - Date.now() - refreshBuffer;

    if (timeUntilRefresh > 0) {
      setTimeout(() => this.refreshToken(), timeUntilRefresh);
    } else {
      this.refreshToken();
    }
  }

  async refreshToken() {
    try {
      const response = await this.request("/auth/refresh", {
        method: "POST",
        skipAuth: true,
        headers: {
          "Refresh-Token": localStorage.getItem("refreshToken"),
        },
      });
      this.setToken(response.token);
      if (response.refreshToken) {
        localStorage.setItem("refreshToken", response.refreshToken);
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      this.handleAuthError();
    }
  }

  async handleResponse(response) {
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    let data;
    try {
      data = isJson ? await response.json() : await response.text();
    } catch (error) {
      throw new ApiError("Invalid response format", response.status);
    }

    if (!response.ok) {
      const error = new ApiError(
        data.message || "API request failed",
        response.status,
        data
      );

      // Handle specific error cases
      switch (response.status) {
        case 400:
          error.name = "ValidationError";
          break;
        case 401:
          error.name = "UnauthorizedError";
          break;
        case 403:
          error.name = "ForbiddenError";
          break;
        case 404:
          error.name = "NotFoundError";
          break;
        case 429:
          error.name = "RateLimitError";
          break;
        case 500:
          error.name = "ServerError";
          break;
      }
      throw error;
    }

    return data;
  }

  async retryRequest(endpoint, options, attempt = 1) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      return await this.handleResponse(response);
    } catch (error) {
      if (attempt < this.maxRetries && this.shouldRetry(error)) {
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.retryRequest(endpoint, options, attempt + 1);
      }
      throw error;
    }
  }

  shouldRetry(error) {
    // Retry on network errors or 5xx server errors
    return !error.status || (error.status >= 500 && error.status < 600);
  }

  async addToRequestQueue(endpoint, options) {
    this.requestQueue.push({ endpoint, options });
    if (!this.isProcessingQueue && navigator.onLine) {
      await this.processRequestQueue();
    }
  }

  async processRequestQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) return;

    this.isProcessingQueue = true;
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue[0];
      try {
        await this.request(request.endpoint, request.options);
        this.requestQueue.shift(); // Remove processed request
      } catch (error) {
        if (!this.shouldRetry(error)) {
          this.requestQueue.shift(); // Remove failed request
        }
        console.error("Error processing queued request:", error);
        break;
      }
    }
    this.isProcessingQueue = false;
  }

  async request(endpoint, options = {}) {
    if (!navigator.onLine) {
      await this.addToRequestQueue(endpoint, options);
      throw new ApiError("Offline mode: Request queued", 0);
    }

    const headers = {
      "Content-Type": "application/json",
      ...(this.token &&
        !options.skipAuth && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    try {
      return await this.retryRequest(endpoint, config);
    } catch (error) {
      if (error.status === 401 && !options.skipAuth) {
        await this.handleAuthError();
      }
      throw error;
    }
  }

  async handleAuthError() {
    try {
      await this.refreshToken();
    } catch (error) {
      this.setToken(null);
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
  }

  // Task-related methods
  async getAllTasks(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/tasks${queryParams ? "?" + queryParams : ""}`, {
      method: "GET",
    });
  }

  async getTaskById(taskId) {
    return this.request(`/tasks/${taskId}`, { method: "GET" });
  }

  async createTask(taskData) {
    return this.request("/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(taskId, taskData) {
    return this.request(`/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(taskId) {
    return this.request(`/tasks/${taskId}`, { method: "DELETE" });
  }

  async getTasksByTeacher(teacherId, filters = {}) {
    const queryParams = new URLSearchParams({
      teacherId,
      ...filters,
    }).toString();
    return this.request(`/tasks?${queryParams}`, { method: "GET" });
  }

  async getUpcomingTasks(days = 7) {
    return this.request(`/tasks/upcoming?days=${days}`, { method: "GET" });
  }

  async searchTasks(query, filters = {}) {
    const queryParams = new URLSearchParams({
      q: query,
      ...filters,
    }).toString();
    return this.request(`/tasks/search?${queryParams}`, { method: "GET" });
  }

  // Comment-related methods
  async getTaskComments(taskId, page = 1, limit = 10) {
    return this.request(
      `/tasks/${taskId}/comments?page=${page}&limit=${limit}`,
      { method: "GET" }
    );
  }

  async addTaskComment(taskId, commentData) {
    return this.request(`/tasks/${taskId}/comments`, {
      method: "POST",
      body: JSON.stringify(commentData),
    });
  }

  async updateTaskComment(taskId, commentId, commentData) {
    return this.request(`/tasks/${taskId}/comments/${commentId}`, {
      method: "PUT",
      body: JSON.stringify(commentData),
    });
  }

  async deleteTaskComment(taskId, commentId) {
    return this.request(`/tasks/${taskId}/comments/${commentId}`, {
      method: "DELETE",
    });
  }

  // User-related methods
  async login(credentials) {
    const response = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
      skipAuth: true,
    });
    this.setToken(response.token);
    if (response.refreshToken) {
      localStorage.setItem("refreshToken", response.refreshToken);
    }
    return response;
  }

  async logout() {
    try {
      await this.request("/auth/logout", { method: "POST" });
    } finally {
      this.setToken(null);
      localStorage.removeItem("refreshToken");
    }
  }

  async getCurrentUser() {
    return this.request("/users/me", { method: "GET" });
  }

  async updateUserProfile(userData) {
    return this.request("/users/me", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async getUsers(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/users${queryParams ? "?" + queryParams : ""}`, {
      method: "GET",
    });
  }

  async changePassword(passwordData) {
    return this.request("/users/me/password", {
      method: "PUT",
      body: JSON.stringify(passwordData),
    });
  }

  async getUserPreferences() {
    try {
      const response = await this.request("/user/preferences");
      return response;
    } catch (error) {
      console.error("Failed to get user preferences:", error);
      return {
        theme: "dark",
        upcomingTasks: true,
        scheduledTasks: true,
      };
    }
  }

  async updateUserPreferences(preferences) {
    return await this.request("/user/preferences", {
      method: "PUT",
      body: JSON.stringify(preferences),
    });
  }

  async updateUsername(username) {
    return await this.request("/user/username", {
      method: "PUT",
      body: JSON.stringify({ username }),
    });
  }

  async deleteAccount() {
    return await this.request("/user/account", {
      method: "DELETE",
    });
  }
}

// Create a singleton instance
const apiService = new ApiService();
Object.freeze(apiService);

export default apiService;
