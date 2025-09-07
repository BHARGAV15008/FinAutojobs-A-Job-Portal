// Standardized API response helper
export class ResponseHelper {
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  static error(res, message = 'Internal server error', statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  }

  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        currentPage: pagination.current_page,
        totalPages: pagination.total_pages,
        totalItems: pagination.total_items,
        itemsPerPage: pagination.items_per_page,
        hasNext: pagination.has_next,
        hasPrev: pagination.has_prev
      },
      timestamp: new Date().toISOString()
    });
  }

  static created(res, data, message = 'Resource created successfully') {
    return ResponseHelper.success(res, data, message, 201);
  }

  static notFound(res, message = 'Resource not found') {
    return ResponseHelper.error(res, message, 404);
  }

  static unauthorized(res, message = 'Unauthorized access') {
    return ResponseHelper.error(res, message, 401);
  }

  static forbidden(res, message = 'Access forbidden') {
    return ResponseHelper.error(res, message, 403);
  }

  static badRequest(res, message = 'Bad request', errors = null) {
    return ResponseHelper.error(res, message, 400, errors);
  }

  static conflict(res, message = 'Resource conflict') {
    return ResponseHelper.error(res, message, 409);
  }

  static validationError(res, errors) {
    return ResponseHelper.error(res, 'Validation failed', 422, errors);
  }
}