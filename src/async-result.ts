import { createSuccess, asyncThen as then, swap } from './utils'
import { SuccessOf, FailureOf, SomeResult, AsyncResult as ResultType, ResultMatcher } from './types'

export type AsyncResult<Success = unknown, Failure = unknown> = ResultType<Success, Failure>

/**
 * Returns a new async result, mapping any success value using the given
 * transformation and unwrapping the produced async result.
 *
 * @param transform A closure that takes the success value of the `result`.
 * @param result Original `AsyncResult` or `Result`.
 * @returns An `AsyncResult` value with the result of evaluating `transform` as the new failure value if `result` represents a failure.
 */
function flatMap<
  NewSuccess,
  NewFailure,
  Success,
  Failure,
  NewResultLike extends SomeResult<NewSuccess, NewFailure> = SomeResult<NewSuccess, NewFailure>,
  ResultLike extends SomeResult<Success, Failure> = SomeResult<Success, Failure>
>(
  transform: (success: SuccessOf<ResultLike>) => NewResultLike,
  result: ResultLike
): AsyncResult<SuccessOf<NewResultLike>, FailureOf<NewResultLike | ResultLike>>

/**
 * Returns a closure that takes a new async result, mapping any success value using the given
 * transformation and unwrapping the produced async result.
 *
 * @param transform A closure that takes the success value of the `result`.
 * @returns A closure that takes an `AsyncResult` or `Result` value with the result of evaluating `transform` as the new failure value if `result` represents a failure.
 */
function flatMap<
  NewSuccess,
  NewFailure,
  Success,
  Failure,
  NewResultLike extends SomeResult<NewSuccess, NewFailure> = SomeResult<NewSuccess, NewFailure>,
  ResultLike extends SomeResult<Success, Failure> = SomeResult<Success, Failure>
>(
  transform: (success: SuccessOf<ResultLike>) => NewResultLike
): (
  result: ResultLike
) => AsyncResult<SuccessOf<NewResultLike>, FailureOf<NewResultLike | ResultLike>>

function flatMap<NewSuccess, NewFailure, Success, Failure>(
  transform: (success: Success) => SomeResult<NewSuccess, NewFailure>,
  result?: SomeResult<Success, Failure>
) {
  return result === undefined
    ? (r: SomeResult<Success, Failure>) => flatMap(transform, r)
    : then(result, (r) => (r.tag === 'success' ? transform(r.success) : r))
}

/**
 * Returns a new async result, mapping any success value using the given
 * transformation.
 *
 * Use this method when you need to transform the value of an `AsyncResult`
 * value when it represents a success.
 *
 * @param transform A closure that takes the success value of `result`.
 * @param result Original `AsyncResult` or `Result`.
 * @returns An `AsyncResult` value with the result of evaluating `transform` as the new success value if `result` represents a success.
 */
function map<
  NewSuccess,
  Success,
  Failure,
  ResultLike extends SomeResult<Success, Failure> = SomeResult<Success, Failure>
>(
  transform: (success: SuccessOf<ResultLike>) => NewSuccess,
  result: ResultLike
): AsyncResult<NewSuccess, FailureOf<ResultLike>>

/**
 * Returns a closure that takes a new async result, mapping any success value using the given
 * transformation.
 *
 * Use this method when you need to transform the value of an `AsyncResult`
 * value when it represents a success.
 *
 * @param transform A closure that takes the success value of `result`.
 * @returns A closure that takes an `AsyncResult` or `Result` value with the result of evaluating `transform` as the new success value if `result` represents a success.
 */
function map<
  NewSuccess,
  Success,
  Failure,
  ResultLike extends SomeResult<Success, Failure> = SomeResult<Success, Failure>
>(
  transform: (success: SuccessOf<ResultLike>) => NewSuccess
): (result: ResultLike) => AsyncResult<NewSuccess, FailureOf<ResultLike>>

function map<NewSuccess, Success, Failure>(
  transform: (success: Success) => NewSuccess,
  result?: SomeResult<Success, Failure>
) {
  return result === undefined
    ? (r: SomeResult<Success, Failure>) => map(transform, r)
    : flatMap((value) => createSuccess(transform(value)), result)
}

/**
 * Returns a new async result, mapping any failure value using the given
 * transformation.
 *
 * Use this method when you need to transform the value of an `AsyncResult`
 * value when it represents a failure.
 *
 * @param transform A closure that takes the failure value of the `result`.
 * @param result Original `AsyncResult` or `Result`.
 * @returns An `AsyncResult` value with the result of evaluating `transform` as the new failure value if `result` represents a failure.
 */
function mapError<
  NewFailure,
  Success,
  Failure,
  ResultLike extends SomeResult<Success, Failure> = SomeResult<Success, Failure>
>(
  transform: (failure: FailureOf<ResultLike>) => NewFailure,
  result: ResultLike
): AsyncResult<SuccessOf<ResultLike>, NewFailure>

/**
 * Returns a closure that takes an async result, mapping any failure value using the given
 * transformation.
 *
 * Use this method when you need to transform the value of an `AsyncResult`
 * value when it represents a failure.
 *
 * @param transform A closure that takes the failure value of the `result`.
 * @returns A closure that takes `AsyncResult` or `Result` value with the result of evaluating `transform` as the new failure value if `result` represents a failure.
 */
function mapError<
  NewFailure,
  Success,
  Failure,
  ResultLike extends SomeResult<Success, Failure> = SomeResult<Success, Failure>
>(
  transform: (failure: FailureOf<ResultLike>) => NewFailure
): (result: ResultLike) => AsyncResult<SuccessOf<ResultLike>, NewFailure>

function mapError<NewFailure, Success, Failure>(
  transform: (failure: Failure) => NewFailure,
  result?: SomeResult<Success, Failure>
) {
  return result === undefined
    ? (r: SomeResult<Success, Failure>) => mapError(transform, r)
    : then(map(transform, then(result, swap)), swap)
}

/**
 * Extracts wrapped value from result and transforms success and failure cases
 *
 * @param transform Success & failure transformers
 * @returns A closure that takes a `Result` and returns transformed wrapped value
 */
function match<ResultLike extends SomeResult, Matcher extends ResultMatcher<ResultLike, unknown>>(
  transform: Matcher
): (
  result: ResultLike
) => Matcher extends ResultMatcher<ResultLike, infer Match> ? Promise<Match> : never

function match<ResultLike extends SomeResult, Matcher extends ResultMatcher<ResultLike, unknown>>(
  transform: Matcher,
  result: ResultLike
): Matcher extends ResultMatcher<ResultLike, infer Match> ? Promise<Match> : never

/**
 * Extracts wrapped value from result and transforms failure case
 * or returns success value as is
 *
 * @param transform Failure transformer
 * @returns A closure that takes a `Result` and returns transformed wrapped value
 */

/**
 * Extracts wrapped value from result and transforms success case
 * or returns failure value as is
 *
 * @param transform Success transformer
 * @returns A closure that takes a `Result` and returns transformed wrapped value
 */

function match<Success, Failure, Match>(
  transform: ResultMatcher<SomeResult<Success, Failure>, Match>,
  result?: SomeResult<Success, Failure>
) {
  return result === undefined
    ? (r: SomeResult<Success, Failure>) => match(transform, r)
    : then(
        result,
        (r) =>
          (r.tag === 'success' ? transform.success?.(r.success) : transform.failure?.(r.failure)) ??
          transform.default
      )
}

function combine<
  ResultLike extends SomeResult,
  Results extends readonly [ResultLike, ResultLike, ...(readonly ResultLike[])],
  Successes extends {
    readonly [Index in keyof Results]: Results[Index] extends ResultLike
      ? SuccessOf<Results[Index]>
      : never
  },
  Failure extends {
    readonly [Index in keyof Results]: Results[Index] extends ResultLike
      ? FailureOf<Results[Index]>
      : never
  }[number]
>(...results: Results): SomeResult<Successes, Failure>

function combine<
  ResultLike extends SomeResult,
  Results extends readonly [ResultLike, ResultLike, ...(readonly ResultLike[])],
  Successes extends {
    readonly [Index in keyof Results]: Results[Index] extends ResultLike
      ? SuccessOf<Results[Index]>
      : never
  },
  Failure extends {
    readonly [Index in keyof Results]: Results[Index] extends ResultLike
      ? FailureOf<Results[Index]>
      : never
  }[number],
  T
>(combiner: (...successes: Successes) => T, ...results: Results): SomeResult<T, Failure>

function combine<Success, Failure, ResultLike extends SomeResult<Success, Failure>, T>(
  combiner: ResultLike | ((...successes: readonly Success[]) => T),
  ...results: readonly ResultLike[]
) {
  const [combinerFun, firstResults] =
    typeof combiner === 'function'
      ? [combiner, []]
      : [(...successes: readonly Success[]) => successes, [combiner]]

  const result = [...firstResults, ...results].reduce<SomeResult<readonly Success[], Failure>>(
    (acc, val) => flatMap((successes) => map((success) => [...successes, success], val), acc),
    createSuccess([])
  )

  return map((successes) => combinerFun(...successes), result)
}

/**
 * Combines multiple results into single one
 *
 * @param results `Result`s to combine
 * @returns A `Result` that holds a tuple of `results` successes or a single failure
 */

/**
 * Combines multiple closures that take one argument and return result into single one
 *
 * @param results Closures to combine
 * @returns A closure that takes one argument and returns a `Result` that holds a tuple of `results` successes or a single failure
 */

/**
 * Combines multiple results into single one
 *
 * @param results Object map of `Result`s to combine
 * @returns A `Result` that holds an object map of `results` successes or a single failure
 */

/**
 * Combines multiple closures that take one argument and return result into single one
 *
 * @param results Closures to combine
 * @returns A closure that takes one argument and returns a `Result` that holds an object map of `results` successes or a single failure
 */

/**
 * Returns a new async result, mapping any success value using the given
 * transformation.
 *
 * Use this method when you need to transform the value of an `AsyncResult`
 * value when it represents a success.
 *
 * @param transform An async closure that takes the success value of `result`.
 * @param result Original `AsyncResult` or `Result`.
 * @returns An `AsyncResult` value with the result of evaluating `transform` as the new success value if `result` represents a success.
 */
function mapAsync<
  NewSuccess,
  Success,
  Failure,
  ResultLike extends SomeResult<Success, Failure> = SomeResult<Success, Failure>
>(
  transform: (success: SuccessOf<ResultLike>) => Promise<NewSuccess>,
  result: ResultLike
): AsyncResult<NewSuccess, FailureOf<ResultLike>>

/**
 * Returns a closure that takes a new async result, mapping any success value using the given
 * transformation.
 *
 * Use this method when you need to transform the value of an `AsyncResult`
 * value when it represents a success.
 *
 * @param transform An async closure that takes the success value of `result`.
 * @returns A closure that takes an `AsyncResult` or `Result` value with the result of evaluating `transform` as the new success value if `result` represents a success.
 */
function mapAsync<
  NewSuccess,
  Success,
  Failure,
  ResultLike extends SomeResult<Success, Failure> = SomeResult<Success, Failure>
>(
  transform: (success: SuccessOf<ResultLike>) => Promise<NewSuccess>
): (result: ResultLike) => AsyncResult<NewSuccess, FailureOf<ResultLike>>

function mapAsync<NewSuccess, Success, Failure>(
  transform: (success: Success) => Promise<NewSuccess>,
  result?: SomeResult<Success, Failure>
) {
  return result === undefined
    ? (r: SomeResult<Success, Failure>) => mapAsync(transform, r)
    : flatMap((value) => transform(value).then(createSuccess), result)
}

/**
 * Returns a new async result, mapping any failure value using the given
 * transformation.
 *
 * Use this method when you need to transform the value of an `AsyncResult`
 * value when it represents a failure.
 *
 * @param transform An async closure that takes the failure value of the `result`.
 * @param result Original `AsyncResult` or `Result`.
 * @returns An `AsyncResult` value with the result of evaluating `transform` as the new failure value if `result` represents a failure.
 */
function mapErrorAsync<
  NewFailure,
  Success,
  Failure,
  ResultLike extends SomeResult<Success, Failure> = SomeResult<Success, Failure>
>(
  transform: (failure: FailureOf<ResultLike>) => Promise<NewFailure>,
  result: ResultLike
): AsyncResult<SuccessOf<ResultLike>, NewFailure>

/**
 * Returns a closure that takes an async result, mapping any failure value using the given
 * transformation.
 *
 * Use this method when you need to transform the value of an `AsyncResult`
 * value when it represents a failure.
 *
 * @param transform An async closure that takes the failure value of the `result`.
 * @returns A closure that takes `AsyncResult` or `Result` value with the result of evaluating `transform` as the new failure value if `result` represents a failure.
 */
function mapErrorAsync<
  NewFailure,
  Success,
  Failure,
  ResultLike extends SomeResult<Success, Failure> = SomeResult<Success, Failure>
>(
  transform: (failure: FailureOf<ResultLike>) => Promise<NewFailure>
): (result: ResultLike) => AsyncResult<SuccessOf<ResultLike>, NewFailure>

function mapErrorAsync<NewFailure, Success, Failure>(
  transform: (failure: Failure) => Promise<NewFailure>,
  result?: SomeResult<Success, Failure>
) {
  return result === undefined
    ? (r: SomeResult<Success, Failure>) => mapErrorAsync(transform, r)
    : then(mapAsync(transform, then(result, swap)), swap)
}

export const AsyncResult = {
  mapAsync,
  mapErrorAsync,
  map,
  flatMap,
  mapError,
  match,
  combine
} as const
