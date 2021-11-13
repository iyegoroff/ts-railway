import { createFailure, createSuccess, swap, syncThen as then } from './utils'
import { SuccessOf, FailureOf, Result as ResultType, Matcher, ResultMatcher } from './types'

export type Result<Success = unknown, Failure = unknown> = ResultType<Success, Failure>

/**
 * Returns a new result, mapping any success value using the given
 * transformation and unwrapping the produced result.
 *
 * @param transform A closure that takes the success value of the `result`.
 * @param result Original `Result`.
 * @returns A `Result` value with the result of evaluating `transform` as the new failure value if `result` represents a failure.
 */
function flatMap<
  NewSuccess,
  NewFailure,
  Success,
  Failure,
  NewResultLike extends Result<NewSuccess, NewFailure> = Result<NewSuccess, NewFailure>,
  ResultLike extends Result<Success, Failure> = Result<Success, Failure>
>(
  transform: (success: SuccessOf<ResultLike>) => NewResultLike,
  result: ResultLike
): Result<SuccessOf<NewResultLike>, FailureOf<NewResultLike | ResultLike>>

/**
 * Returns a closure that takes a new result, mapping any success value using the given
 * transformation and unwrapping the produced result.
 *
 * @param transform A closure that takes the success value of the `result`.
 * @returns A closure that takes a `Result` value with the result of evaluating `transform` as the new failure value if `result` represents a failure.
 */
function flatMap<
  NewSuccess,
  NewFailure,
  Success,
  Failure,
  NewResultLike extends Result<NewSuccess, NewFailure> = Result<NewSuccess, NewFailure>,
  ResultLike extends Result<Success, Failure> = Result<Success, Failure>
>(
  transform: (success: SuccessOf<ResultLike>) => NewResultLike
): (result: ResultLike) => Result<SuccessOf<NewResultLike>, FailureOf<NewResultLike | ResultLike>>

function flatMap<NewSuccess, NewFailure, Success, Failure>(
  transform: (success: Success) => Result<NewSuccess, NewFailure>,
  result?: Result<Success, Failure>
) {
  return result === undefined
    ? (r: Result<Success, Failure>) => flatMap(transform, r)
    : then(result, (r) => (r.tag === 'success' ? transform(r.success) : r))
}

/**
 * Returns a new result, mapping any success value using the given
 * transformation.
 *
 * Use this method when you need to transform the value of a `Result`
 * value when it represents a success. The following example transforms
 * the number success value of a result into a string:
 *
 *      function getNextNumber(): Result<number, Error> { ... }
 *
 *      const numberResult = getNextNumber()
 *      // numberResult == Result.success(5)
 *      const stringResult = Result.map((value) => `${value}`, numberResult)
 *      // stringResult == Result.success('5')
 *
 * @param transform A closure that takes the success value of `result`.
 * @param result Original `Result`.
 * @returns A `Result` value with the result of evaluating `transform` as the new success value if `result` represents a success.
 */
function map<
  NewSuccess,
  Success,
  Failure,
  ResultLike extends Result<Success, Failure> = Result<Success, Failure>
>(
  transform: (success: SuccessOf<ResultLike>) => NewSuccess,
  result: ResultLike
): Result<NewSuccess, FailureOf<ResultLike>>

/**
 * Returns a closure that takes a new result, mapping any success value using the given
 * transformation.
 *
 * Use this method when you need to transform the value of a `Result`
 * value when it represents a success. The following example transforms
 * the number success value of a result into a string:
 *
 *      function getNextNumber(): Result<number, Error> { ... }
 *
 *      const numberResult = getNextNumber()
 *      // numberResult == Result.success(5)
 *      const stringResult = Result.map((value) => `${value}`)(numberResult)
 *      // stringResult == Result.success('5')
 *
 * @param transform A closure that takes the success value of `result`.
 * @returns A closure that takes a `Result` value with the result of evaluating `transform` as the new success value if `result` represents a success.
 */
function map<
  NewSuccess,
  Success,
  Failure,
  ResultLike extends Result<Success, Failure> = Result<Success, Failure>
>(
  transform: (success: SuccessOf<ResultLike>) => NewSuccess
): (result: ResultLike) => Result<NewSuccess, FailureOf<ResultLike>>

function map<NewSuccess, Success, Failure>(
  transform: (success: Success) => NewSuccess,
  result?: Result<Success, Failure>
) {
  return result === undefined
    ? (r: Result<Success, Failure>) => map(transform, r)
    : flatMap((value) => createSuccess(transform(value)), result)
}

/**
 * Returns a new result, mapping any failure value using the given
 * transformation.
 *
 * Use this method when you need to transform the value of a `Result`
 * value when it represents a failure. The following example transforms
 * the error value of a result by wrapping it in a custom `Error` type:
 *
 *      class DatedError extends Error {
 *        readonly date: Date = new Date()
 *      }
 *
 *      const result: Result<number, Error> = // ...
 *      // result == Result.failure(<error value>)
 *      const resultWithDatedError = Result.mapError((value) => new DatedError(value.message), result)
 *      // result == Result.failure(DatedError(date: <date>))
 *
 *  @param transform A closure that takes the failure value of the `result`.
 *  @param result Original `Result`.
 *  @returns A `Result` value with the result of evaluating `transform` as the new failure value if `result` represents a failure.
 */
function mapError<
  NewFailure,
  Success,
  Failure,
  ResultLike extends Result<Success, Failure> = Result<Success, Failure>
>(
  transform: (failure: FailureOf<ResultLike>) => NewFailure,
  result: ResultLike
): Result<SuccessOf<ResultLike>, NewFailure>

/**
 * Returns a closure that takes a result, mapping any failure value using the given
 * transformation.
 *
 * Use this method when you need to transform the value of a `Result`
 * value when it represents a failure. The following example transforms
 * the error value of a result by wrapping it in a custom `Error` type:
 *
 *      class DatedError extends Error {
 *        readonly date: Date = new Date()
 *      }
 *
 *      const result: Result<number, Error> = // ...
 *      // result == Result.failure(<error value>)
 *      const resultWithDatedError = Result.mapError((value) => new DatedError(value.message))(result)
 *      // result == Result.failure(DatedError(date: <date>))
 *
 *  @param transform A closure that takes the failure value of the `result`.
 *  @returns A closure that takes `Result` value with the result of evaluating `transform` as the new failure value if `result` represents a failure.
 */
function mapError<
  NewFailure,
  Success,
  Failure,
  ResultLike extends Result<Success, Failure> = Result<Success, Failure>
>(
  transform: (failure: FailureOf<ResultLike>) => NewFailure
): (result: ResultLike) => Result<SuccessOf<ResultLike>, NewFailure>

function mapError<NewFailure, Success, Failure>(
  transform: (failure: Failure) => NewFailure,
  result?: Result<Success, Failure>
) {
  return result === undefined
    ? (r: Result<Success, Failure>) => mapError(transform, r)
    : then(map(transform, then(result, swap)), swap)
}

/**
 * Extracts wrapped value from result and transforms success and failure cases
 *
 * @param transform Success & failure transformers
 * @returns A closure that takes a `Result` and returns transformed wrapped value
 */
function match<ResultLike extends Result, MatcherLike extends Matcher<ResultLike, unknown>>(
  transform: MatcherLike
): (result: ResultLike) => MatcherLike extends Matcher<ResultLike, infer Match> ? Match : never

function match<ResultLike extends Result, MatcherLike extends Matcher<ResultLike, unknown>>(
  transform: MatcherLike,
  result: ResultLike
): MatcherLike extends Matcher<ResultLike, infer Match> ? Match : never

function match<ResultLike extends Result, Match>(
  transform: ResultMatcher<SuccessOf<ResultLike>, FailureOf<ResultLike>, Match>,
  result: ResultLike
): Match

function match<ResultLike extends Result, Match>(
  transform: ResultMatcher<SuccessOf<ResultLike>, FailureOf<ResultLike>, Match>
): (result: ResultLike) => Match

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
  transform: Matcher<Result<Success, Failure>, Match>,
  result?: Result<Success, Failure>
) {
  return result === undefined
    ? (r: Result<Success, Failure>) => match(transform, r)
    : then(
        result,
        (r) =>
          (r.tag === 'success' ? transform.success?.(r.success) : transform.failure?.(r.failure)) ??
          transform.default
      )
}

function combine<
  ResultLike extends Result,
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
>(...results: Results): Result<Successes, Failure>

function combine<
  ResultLike extends Result,
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
>(combiner: (...successes: Successes) => T, ...results: Results): Result<T, Failure>

function combine<Success, Failure, ResultLike extends Result<Success, Failure>, T>(
  combiner: ResultLike | ((...successes: readonly Success[]) => T),
  ...results: readonly ResultLike[]
) {
  const [combinerFun, firstResults] =
    typeof combiner === 'function'
      ? [combiner, []]
      : [(...successes: readonly Success[]) => successes, [combiner]]

  const result = [...firstResults, ...results].reduce<Result<readonly Success[], Failure>>(
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

export const Result = {
  success: createSuccess,
  failure: createFailure,
  map,
  flatMap,
  mapError,
  match,
  combine
} as const
