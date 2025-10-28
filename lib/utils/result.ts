/**
 * Result type for standardized error handling
 * Provides a type-safe way to handle success and error cases
 */
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

/**
 * Create a successful result
 */
export const Ok = <T>(value: T): Result<T, never> => ({ 
  ok: true, 
  value 
});

/**
 * Create an error result
 */
export const Err = <E = Error>(error: E): Result<never, E> => ({ 
  ok: false, 
  error 
});

/**
 * Check if a result is successful
 */
export const isOk = <T, E>(result: Result<T, E>): result is { ok: true; value: T } => {
  return result.ok === true;
};

/**
 * Check if a result is an error
 */
export const isErr = <T, E>(result: Result<T, E>): result is { ok: false; error: E } => {
  return result.ok === false;
};

/**
 * Unwrap a result value or throw the error
 */
export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (result.ok) {
    return result.value;
  }
  throw result.error;
};

/**
 * Unwrap a result value or return a default
 */
export const unwrapOr = <T, E>(result: Result<T, E>, defaultValue: T): T => {
  if (result.ok) {
    return result.value;
  }
  return defaultValue;
};

/**
 * Map a result value
 */
export const map = <T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> => {
  if (result.ok) {
    return Ok(fn(result.value));
  }
  return result;
};

/**
 * Map a result error
 */
export const mapErr = <T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> => {
  if (!result.ok) {
    return Err(fn(result.error));
  }
  return result;
};

/**
 * Async Result wrapper for promises
 */
export const fromPromise = async <T>(
  promise: Promise<T>,
  errorMessage?: string
): Promise<Result<T, string>> => {
  try {
    const value = await promise;
    return Ok(value);
  } catch (error) {
    const message = errorMessage || (error instanceof Error ? error.message : 'Unknown error');
    return Err(message);
  }
};
