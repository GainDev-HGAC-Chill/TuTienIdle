function notFound(req, res) {
  res.status(404).json({
    success: false,
    error: `Không tìm thấy ${req.method} ${req.originalUrl}`
  });
}

function errorHandler(error, req, res, _next) {
  const statusCode = Number(error.statusCode || 500);
  const payload = {
    success: false,
    error: error.message || 'Thiên Cơ hỗn loạn.'
  };

  // 4xx là lỗi nghiệp vụ/yêu cầu phía client, không phải server hỏng.
  if (statusCode >= 500) {
    console.error('[SERVER_ERROR]', {
      method: req.method,
      url: req.originalUrl,
      message: error.message,
      stack: error.stack
    });
  } else if (process.env.LOG_CLIENT_ERRORS === 'true') {
    console.warn('[CLIENT_REQUEST]', {
      statusCode,
      method: req.method,
      url: req.originalUrl,
      message: error.message
    });
  }

  res.status(statusCode).json(payload);
}

module.exports = { notFound, errorHandler };
