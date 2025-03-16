/**
 * Utility for monitoring API health and performance
 */

class APIMonitor {
  constructor() {
    this.endpoints = new Map();
    this.backoffTimes = [1000, 2000, 5000, 10000]; // Increasing backoff times
  }

  /**
   * Record the outcome of an API request
   * @param {string} endpoint - The API endpoint
   * @param {boolean} success - Whether the request was successful
   * @param {number} responseTime - Request response time in ms
   */
  recordRequest(endpoint, success, responseTime) {
    if (!this.endpoints.has(endpoint)) {
      this.endpoints.set(endpoint, {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        avgResponseTime: 0,
        consecutiveFailures: 0,
        lastStatus: null,
      });
    }

    const stats = this.endpoints.get(endpoint);
    stats.totalRequests++;

    if (success) {
      stats.successfulRequests++;
      stats.consecutiveFailures = 0;
      stats.avgResponseTime =
        (stats.avgResponseTime * (stats.totalRequests - 1) + responseTime) /
        stats.totalRequests;
    } else {
      stats.failedRequests++;
      stats.consecutiveFailures++;
    }

    stats.lastStatus = success ? "success" : "failure";
  }

  /**
   * Get the recommended wait time before retrying a failed request
   * @param {string} endpoint - The API endpoint
   * @returns {number} - Recommended wait time in milliseconds
   */
  getBackoffTime(endpoint) {
    const stats = this.endpoints.get(endpoint);
    if (!stats) return 0;

    const index = Math.min(
      stats.consecutiveFailures - 1,
      this.backoffTimes.length - 1
    );
    return index >= 0 ? this.backoffTimes[index] : 0;
  }

  /**
   * Check if an endpoint is considered unstable
   * @param {string} endpoint - The API endpoint
   * @returns {boolean} - True if the endpoint is unstable
   */
  isEndpointUnstable(endpoint) {
    const stats = this.endpoints.get(endpoint);
    if (!stats) return false;

    return stats.consecutiveFailures >= 3;
  }

  /**
   * Reset statistics for an endpoint
   * @param {string} endpoint - The API endpoint
   */
  resetStats(endpoint) {
    if (this.endpoints.has(endpoint)) {
      this.endpoints.delete(endpoint);
    }
  }

  /**
   * Get statistics for an endpoint
   * @param {string} endpoint - The API endpoint
   * @returns {Object} - Endpoint statistics
   */
  getStats(endpoint) {
    return this.endpoints.get(endpoint) || null;
  }
}

// Export a singleton instance
export default new APIMonitor();
