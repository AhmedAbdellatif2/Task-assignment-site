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
        data.message || data.error || "API request failed",
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
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    try {
      return await this.retryRequest(endpoint, config);
    } catch (error) {
      throw error;
    }
  }

  async handleAuthError() {
    // No-op: no token refresh, just reload to login
    window.location.href = "/login";
  }

  // Task-related methods
  async getAllTasks(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/tasks/${queryParams ? "?" + queryParams : ""}`, {
      method: "GET",
    });
  }

  async getTaskById(taskId) {
    return this.request(`/tasks/${taskId}/`, { method: "GET" });
  }

  async createTask(taskData) {
    console.log("Creating task with data:", taskData);
    // Use the correct backend endpoint for adding a task
    return this.request("/addtask/api/", {
      method: "POST",
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(taskId, taskData) {
    return this.request(`/tasks/${taskId}/update/`, {
      method: "PUT",
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(taskId) {
    // Use the correct backend endpoint for deleting a task
    return this.request(`/tasks/${taskId}/delete/`, { method: "DELETE" });
  }

  async getTasksByTeacher(teacherId, filters = {}) {
    const queryParams = new URLSearchParams({
      assigned_to: teacherId,
      ...filters,
    }).toString();
    return this.request(`/tasks/${queryParams ? "?" + queryParams : ""}`, {
      method: "GET",
    });
  }

  // No /tasks/upcoming or /tasks/search endpoints in backend, so remove these

  // Comment-related methods
  async getTaskComments(taskId) {
    return this.request(`/tasks/${taskId}/comments/`, { method: "GET" });
  }

  async addTaskComment(taskId, commentData) {
    return this.request(`/tasks/${taskId}/comments/add/`, {
      method: "POST",
      body: JSON.stringify(commentData),
    });
  }

  // No update/delete comment endpoints in backend, so remove these

  // User-related methods
  async login(credentials) {
    return this.request("/auth/login/", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    try {
      await this.request("/auth/logout/", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  }

  async signup(userData) {
    return this.request("/auth/signup/", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async checkUsername(username) {
    return this.request(
      `/auth/check-username/?username=${encodeURIComponent(username)}`,
      { method: "GET" }
    );
  }

  async getCurrentUser() {
    return this.request("/users/me", { method: "GET" });
  }

  async updateUserProfile(userData) {
    return this.request("/users/me/", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async getUsers(filters = {}) {
    // Only admin can list users; filters are not used in backend
    return this.request("/users/", { method: "GET" });
  }

  async changePassword(passwordData) {
    return this.request("/users/me/password/", {
      method: "PUT",
      body: JSON.stringify(passwordData),
    });
  }

  async getUserPreferences() {
    return this.request("/user/preferences", { method: "GET" });
  }

  async updateUserPreferences(preferences) {
    return this.request("/user/preferences/", {
      method: "PUT",
      body: JSON.stringify(preferences),
    });
  }

  async updateUsername(username) {
    return this.request("/user/username/", {
      method: "PUT",
      body: JSON.stringify({ username }),
    });
  }

  async deleteAccount() {
    return this.request("/user/account", {
      method: "DELETE",
    });
  }

  // Add a searchTasks method to ApiService
  async searchTasks(query) {
    // If your backend supports a search endpoint, use it. Otherwise, filter client-side.
    // Here, we use getAllTasks and filter client-side as a fallback.
    const allTasks = await this.getAllTasks();
    const lowerQuery = query.toLowerCase();
    return allTasks.filter(
      (task) =>
        (task.title && task.title.toLowerCase().includes(lowerQuery)) ||
        (task.description &&
          task.description.toLowerCase().includes(lowerQuery))
    );
  }
  // for upcoming
  async getUpcomingTasks() {
  return this.request("/tasks/upcoming/", {
    method: "GET",
  });
}
}

// Create a singleton instance
const apiService = new ApiService();
Object.freeze(apiService);

export default apiService;
