import {
  createFailure,
  createSuccess,
  isCombineFunArray,
  isSuccess,
  swap,
  syncThen as then
} from './utils.js'
import {
  type SuccessOf,
  type FailureOf,
  type Result as ResultType,
  type Matcher,
  type ResultMatcher,
  type CombineArray,
  type CombineFunArray
} from './types.js'

export type Result<Success = unknown, Failure = unknown> = ResultType<Success, Failure>

/**
 * Returns a function that takes a new result, mapping any success value using the given
 * transformation and unwrapping the produced result.
 *
 * @param transform A function that takes a success value of the `result`.
 * @returns A function that takes a `Result` value with the result of evaluating `transform` as
 *          the new failure value if `result` represents a failure.
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

/**
 * Returns a function that takes a new result, mapping any success value using the given
 * transformation and unwrapping the produced result.
 *
 * @param transform A function that takes a success value of the `result`.
 * @returns A function that takes a `Result` value with the result of evaluating `transform` as
 *          the new failure value if `result` represents a failure.
 */
function flatMap<Transform extends (success: never) => Result>(
  transform: Transform
): <Failure>(
  result: Result<Parameters<Transform>[0], Failure>
) => Result<SuccessOf<ReturnType<Transform>>, FailureOf<ReturnType<Transform>> | Failure>

/**
 * Returns a new result, mapping any success value using the given
 * transformation and unwrapping the produced result.
 *
 * @param transform A function that takes a success value of the `result` and returns another `Result`.
 * @param result Original `Result`.
 * @returns A `Result` value with the result of evaluating `transform` as the new failure value if
 *          `result` represents a failure.
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
 * Returns a new result, mapping any success value using the given
 * transformation and unwrapping the produced result.
 *
 * @param transform A function that takes a success value of the `result` and returns another `Result`.
 * @param result Original `Result`.
 * @returns A `Result` value with the result of evaluating `transform` as the new failure value if
 *          `result` represents a failure.
 */
function flatMap<NewSuccess, NewFailure, Success, Failure>(
  transform: (success: Success) => Result<NewSuccess, NewFailure>,
  result: Result<Success, Failure>
): Result<NewSuccess, NewFailure | Failure>

function flatMap<NewSuccess, NewFailure, Success, Failure>(
  transform: (success: Success) => Result<NewSuccess, NewFailure>,
  result?: Result<Success, Failure>
) {
  return result === undefined
    ? (r: Result<Success, Failure>) => flatMap(transform, r)
    : then(result, (r) => (isSuccess(r) ? transform(r.success) : r))
}

/**
 * Returns a function that takes a new result, mapping any success value using the given
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
 * @param transform A function that takes the success value of `result`.
 * @returns A function that takes a `Result` value with the result of evaluating `transform` as
 *          the new success value if `result` represents a success.
 */
function map<
  NewSuccess,
  Success,
  Failure,
  ResultLike extends Result<Success, Failure> = Result<Success, Failure>
>(
  transform: (success: SuccessOf<ResultLike>) => NewSuccess
): (result: ResultLike) => Result<NewSuccess, FailureOf<ResultLike>>

/**
 * Returns a function that takes a new result, mapping any success value using the given
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
 * @param transform A function that takes the success value of `result`.
 * @returns A function that takes a `Result` value with the result of evaluating `transform` as
 *          the new success value if `result` represents a success.
 */
function map<Transform extends (success: never) => unknown>(
  transform: Transform
): <Failure>(
  result: Result<Parameters<Transform>[0], Failure>
) => Result<ReturnType<Transform>, Failure>

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
 * @param transform A function that takes the success value of `result`.
 * @param result Original `Result`.
 * @returns A `Result` value with the result of evaluating `transform` as the new success value if
 *          `result` represents a success.
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
 * Returns a new result, mapping any success value using the given
 * transformation.
 *
 * @param transform A function that takes the success value of `result`.
 * @param result Original `Result`.
 * @returns A `Result` value with the result of evaluating `transform` as the new success value if
 *          `result` represents a success.
 */
function map<NewSuccess, Success, Failure>(
  transform: (success: Success) => NewSuccess,
  result: Result<Success, Failure>
): Result<NewSuccess, Failure>

function map<NewSuccess, Success, Failure>(
  transform: (success: Success) => NewSuccess,
  result?: Result<Success, Failure>
) {
  return result === undefined
    ? (r: Result<Success, Failure>) => map(transform, r)
    : flatMap((value) => createSuccess(transform(value)), result)
}

/**
 * Returns a function that takes a new result, mapping any failure value using the given
 * transformation and unwrapping the produced result.
 *
 * @param transform A function that takes the failure value of the `result`.
 * @returns A function that takes a `Result` value, either from the function or
 *          the previous `success`.
 */
function flatMapError<
  NewFailure,
  Success,
  Failure,
  NewResultLike extends Result<never, NewFailure> = Result<never, NewFailure>,
  ResultLike extends Result<Success, Failure> = Result<Success, Failure>
>(
  transform: (failure: FailureOf<ResultLike>) => NewResultLike
): (result: ResultLike) => Result<SuccessOf<ResultLike>, FailureOf<NewResultLike>>

/**
 * Returns a function that takes a new result, mapping any failure value using the given
 * transformation and unwrapping the produced result.
 *
 * @param transform A function that takes the failure value of the `result`.
 * @returns A function that takes a `Result` value, either from the function or
 *          the previous `success`.
 */
function flatMapError<Transform extends (failure: never) => Result<never, unknown>>(
  transform: Transform
): <Success>(
  result: Result<Success, Parameters<Transform>[0]>
) => Result<Success, FailureOf<ReturnType<Transform>>>

/**
 * Returns a new result, mapping any failure value using the given
 * transformation and unwrapping the produced result.
 *
 * @param transform A function that takes the failure value of the `result`.
 * @param result Original `Result`.
 * @returns A `Result` value, either from the function or the previous `success`.
 */
function flatMapError<
  NewFailure,
  Success,
  Failure,
  NewResultLike extends Result<never, NewFailure> = Result<never, NewFailure>,
  ResultLike extends Result<Success, Failure> = Result<Success, Failure>
>(
  transform: (failure: FailureOf<ResultLike>) => NewResultLike,
  result: ResultLike
): Result<SuccessOf<ResultLike>, FailureOf<NewResultLike>>

/**
 * Returns a new result, mapping any failure value using the given
 * transformation and unwrapping the produced result.
 *
 * @param transform A function that takes the failure value of the `result`.
 * @param result Original `Result`.
 * @returns A `Result` value, either from the function or the previous `success`.
 */
function flatMapError<NewFailure, Success, Failure>(
  transform: (failure: Failure) => Result<never, NewFailure>,
  result: Result<Success, Failure>
): Result<Success, NewFailure>

function flatMapError<NewFailure, Success, Failure>(
  transform: (failure: Failure) => Result<never, NewFailure>,
  result?: Result<Success, Failure>
) {
  return result === undefined
    ? (r: Result<Success, Failure>) => flatMapError(transform, r)
    : then(result, (r) => (isSuccess(r) ? r : transform(r.failure)))
}

/**
 * Returns a function that takes a result, mapping any failure value using the given
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
 *  @param transform A function that takes the failure value of the `result`.
 *  @returns A function that takes `Result` value with the result of evaluating `transform` as
 *           the new failure value if `result` represents a failure.
 */
function mapError<
  NewFailure,
  Success,
  Failure,
  ResultLike extends Result<Success, Failure> = Result<Success, Failure>
>(
  transform: (failure: FailureOf<ResultLike>) => NewFailure
): (result: ResultLike) => Result<SuccessOf<ResultLike>, NewFailure>

/**
 * Returns a function that takes a result, mapping any failure value using the given
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
 *  @param transform A function that takes the failure value of the `result`.
 *  @returns A function that takes `Result` value with the result of evaluating `transform` as
 *           the new failure value if `result` represents a failure.
 */
function mapError<Transform extends (failure: never) => unknown>(
  transform: Transform
): <Success>(
  result: Result<Success, Parameters<Transform>[0]>
) => Result<Success, ReturnType<Transform>>

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
 *  @param transform A function that takes the failure value of the `result`.
 *  @param result Original `Result`.
 *  @returns A `Result` value with the result of evaluating `transform` as the new failure value if
 *           `result` represents a failure.
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
 * Returns a new result, mapping any failure value using the given
 * transformation.
 *
 *  @param transform A function that takes the failure value of the `result`.
 *  @param result Original `Result`.
 *  @returns A `Result` value with the result of evaluating `transform` as the new failure value if
 *           `result` represents a failure.
 */
function mapError<NewFailure, Success, Failure>(
  transform: (failure: Failure) => NewFailure,
  result: Result<Success, Failure>
): Result<Success, NewFailure>

function mapError<NewFailure, Success, Failure>(
  transform: (failure: Failure) => NewFailure,
  result?: Result<Success, Failure>
) {
  return result === undefined
    ? (r: Result<Success, Failure>) => mapError(transform, r)
    : then(map(transform, then(result, swap)), swap)
}

/**
 * Unwraps result and transforms success and failure values
 * or returns a default value if needed transform is not provided
 *
 * @param transform Success & failure transformers and default value
 * @returns A function that takes a `Result` and returns transformed wrapped value or default value
 */
function match<ResultLike extends Result, MatcherLike extends Matcher<ResultLike, unknown>>(
  transform: MatcherLike
): (result: ResultLike) => MatcherLike extends Matcher<ResultLike, infer Match> ? Match : never

/**
 * Unwraps result and transforms success and failure values
 * or returns a default value if needed transform is not provided
 *
 * @param transform Success & failure transformers and default value
 * @param result A `Result` to unwrap
 * @returns Transformed wrapped value or default value
 */
function match<ResultLike extends Result, MatcherLike extends Matcher<ResultLike, unknown>>(
  transform: MatcherLike,
  result: ResultLike
): MatcherLike extends Matcher<ResultLike, infer Match> ? Match : never

/**
 * Unwraps result and transforms success and failure values
 * or returns a default value if needed transform is not provided
 *
 * Additional siganture for generic results
 *
 * @param transform Success & failure transformers and default value
 * @param result A `Result` to unwrap
 * @returns Transformed wrapped value or default value
 */
function match<
  ResultLike extends Result,
  MatcherLike extends ResultMatcher<SuccessOf<ResultLike>, FailureOf<ResultLike>, unknown>
>(
  transform: MatcherLike,
  result: ResultLike
): MatcherLike extends Matcher<ResultLike, infer Match> ? Match : never

/**
 * Unwraps result and transforms success and failure values
 * or returns a default value if needed transform is not provided
 *
 * Additional siganture for generic results
 *
 * @param transform Success & failure transformers and default value
 * @returns A function that takes a `Result` and returns transformed wrapped value or default value
 */
function match<
  ResultLike extends Result,
  MatcherLike extends ResultMatcher<SuccessOf<ResultLike>, FailureOf<ResultLike>, unknown>
>(
  transform: MatcherLike
): (result: ResultLike) => MatcherLike extends Matcher<ResultLike, infer Match> ? Match : never

function match<Success, Failure, Match>(
  transform: Matcher<Result<Success, Failure>, Match>,
  result?: Result<Success, Failure>
) {
  return result === undefined
    ? (r: Result<Success, Failure>) => match(transform, r)
    : then(
        result,
        (r) =>
          (isSuccess(r) ? transform.success?.(r.success) : transform.failure?.(r.failure)) ??
          transform.default
      )
}

/**
 * Combines multiple `Result`s into single one
 *
 * @param results `Result`s to combine
 * @returns A `Result` that holds a tuple of successes or a single failure
 */
function combine<
  ResultLike extends Result,
  Results extends CombineArray<ResultLike>,
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

/**
 * Combines multiple functions that have 0-1 arguments return `Result`s into single one that takes
 * an array of arguments
 *
 * @param results Functions that return `Result`s to combine
 * @returns A Function that takes an array of arguments and returns a `Result` that holds
 *          a tuple of successes or a single failure. If all combined functions have zero arguments
 *          resulting function also will take zero arguments instead of an array of undefined values
 */
function combine<
  ResultLike extends Result,
  Results extends CombineArray<(arg: never) => ResultLike>,
  Successes extends {
    readonly [Index in keyof Results]: Results[Index] extends (arg: infer _) => ResultLike
      ? SuccessOf<ReturnType<Results[Index]>>
      : never
  },
  Args extends {
    readonly [Index in keyof Results]: Results[Index] extends (arg: infer Arg) => ResultLike
      ? unknown extends Arg
        ? undefined
        : Arg
      : never
  },
  Failure extends {
    readonly [Index in keyof Results]: Results[Index] extends (arg: infer _) => ResultLike
      ? FailureOf<ReturnType<Results[Index]>>
      : never
  }[number]
>(
  ...results: Results
): Args extends CombineArray<undefined>
  ? () => Result<Successes, Failure>
  : (args: Args) => Result<Successes, Failure>

function combine<Success, Failure, Arg, ResultLike extends Result<Success, Failure>>(
  ...results: CombineArray<ResultLike> | CombineFunArray<Arg, ResultLike>
) {
  return isCombineFunArray(results)
    ? (args: CombineArray<Arg>) =>
        combine(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          ...results.map((r, i) => r(args?.[i]))
        )
    : results.reduce<Result<readonly Success[], Failure>>(
        (acc, val) => flatMap((successes) => map((success) => [...successes, success], val), acc),
        createSuccess([])
      )
}

export const Result = {
  success: createSuccess,
  failure: createFailure,
  map,
  flatMap,
  mapError,
  flatMapError,
  match,
  combine
} as const
