function resolveErrorType({ status, code }) {
  if (
    status === 401 ||
    status === 403 ||
    code === "not_authenticated" ||
    code === "authentication_failed"
  ) {
    return "auth";
  }

  if (code === "validation_error") {
    return "validation";
  }

  if (status >= 500) {
    return "server";
  }

  return "business";
}

export function normalizeApiError(error) {
  if (!error?.response) {
    return {
      code: "network_error",
      message: "Не удалось подключиться к серверу.",
      details: {},
      status: null,
      type: "network",
    };
  }

  const status = error.response.status;

  const backendError = error.response.data?.error;

  if (backendError) {
    const code = backendError.code ?? "api_error";

    return {
      code,
      message: backendError.message ?? "Произошла ошибка.",
      details: backendError.details ?? {},
      status,
      type: resolveErrorType({
        status,
        code,
      }),
    };
  }

  const code = "api_error";

  return {
    code,
    message:
      status >= 500
        ? "Ошибка сервера."
        : "Произошла ошибка при выполнении запроса.",
    details: {},
    status,
    type: resolveErrorType({
      status,
      code,
    }),
  };
}
