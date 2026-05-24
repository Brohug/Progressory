const sanitizeErrorForLog = (error) => {
  if (!error) {
    return { message: 'Unknown error' };
  }

  return {
    name: error.name,
    message: error.message,
    code: error.code,
    errno: error.errno,
    sqlState: error.sqlState,
    statusCode: error.statusCode
  };
};

const logServerError = (label, error) => {
  console.error(label, sanitizeErrorForLog(error));
};

const normalizeMessage = (message, fallback) => {
  if (typeof message === 'string' && message.trim()) {
    return message.trim();
  }

  return fallback;
};

const sendJsonMessage = (res, status, message, fallback = 'Request failed') => {
  const safeMessage = normalizeMessage(message, fallback);
  return res.status(status).json({ message: safeMessage });
};

const sendServerError = (
  res,
  {
    message = 'Server error',
    status = 500
  } = {}
) => sendJsonMessage(res, status, message);

const sendClientError = (
  res,
  {
    status = 400,
    message = 'Request failed'
  } = {}
) => sendJsonMessage(res, status, message);

const handleServerError = (res, label, error, options = {}) => {
  logServerError(label, error);
  return sendServerError(res, options);
};

module.exports = {
  sanitizeErrorForLog,
  logServerError,
  sendJsonMessage,
  sendClientError,
  sendServerError,
  handleServerError
};
