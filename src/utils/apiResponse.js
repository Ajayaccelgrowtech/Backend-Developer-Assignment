class ApiResponse {
  constructor(statusCode, data, message = 'Success', pagination = null) {
    this.success = statusCode < 400;
    this.message = message;
    if (data !== undefined && data !== null) {
      this.data = data;
    }
    if (pagination) {
      this.pagination = pagination;
    }
  }

  static success(res, message = 'Success', data = null, statusCode = 200, pagination = null) {
    return res.status(statusCode).json(new ApiResponse(statusCode, data, message, pagination));
  }

  static created(res, message = 'Created successfully', data = null) {
    return res.status(201).json(new ApiResponse(201, data, message));
  }
}

module.exports = ApiResponse;
