import { createSuccess, asyncThen as then, swap, isSuccess, isCombineFunArray } from './utils.js'
import {
  SuccessOf,
  FailureOf,
  SomeResult,
  AsyncResult as ResultType,
  Matcher,
  ResultMatcher,
  CombineArray,
  CombineFunArray
} from './types.js'

export type AsyncResult<Success = unknown, Failure = unknown> = ResultType<Success, Failure>

/**
 * Returns a new async result, mapping any success value using the given
 * transformation and unwrapping the produced async result.
 *
 * @param transform A function that takes the success value of the `result`.
 * @param result Original `SomeResult`.
 * @returns An `AsyncResult` value with the result of evaluating `transform` as the new failure
 *          value if `result` represents a failure.
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
 * Returns a new async result, mapping any success value using the given
 * transformation and unwrapping the produced async result.
 *
 * @param transform A function that takes the success value of the `result`.
 * @param result Original `SomeResult`.
 * @returns An `AsyncResult` value with the result of evaluating `transform` as the new failure
 *          value if `result` represents a failure.
 */
function flatMap<NewSuccess, NewFailure, Success, Failure>(
  transform: (success: Success) => SomeResult<NewSuccess, NewFailure>,
  result: SomeResult<Success, Failure>
): AsyncResult<NewSuccess, NewFailure | Failure>

/**
 * Returns a function that takes a new async result, mapping any success value using the given
 * transformation and unwrapping the produced async result.
 *
 * @param transform A function that takes the success value of the `result`.
 * @returns A function that takes a `SomeResult` value with the result of evaluating `transform` as
 *          the new failure value if `result` represents a failure.
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
    : then(result, (r) => (isSuccess(r) ? transform(r.success) : r))
}

/**
 * Returns a new async result, mapping any success value using the given
 * transformation.
 *
 * Use this method when you need to transform the value of an `AsyncResult`
 * value when it represents a success.
 *
 * @param transform A function that takes the success value of `result`.
 * @param result Original `SomeResult`.
 * @returns An `AsyncResult` value with the result of evaluating `transform` as the new success
 *          value if `result` represents a success.
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
 * Returns a new async result, mapping any success value using the given
 * transformation.
 *
 * Use this method when you need to transform the value of an `AsyncResult`
 * value when it represents a success.
 *
 * @param transform A function that takes the success value of `result`.
 * @param result Original `SomeResult`.
 * @returns An `AsyncResult` value with the result of evaluating `transform` as the new success
 *          value if `result` represents a success.
 */
function map<NewSuccess, Success, Failure>(
  transform: (success: Success) => NewSuccess,
  result: SomeResult<Success, Failure>
): AsyncResult<NewSuccess, Failure>

/**
 * Returns a function that takes a new async result, mapping any success value using the given
 * transformation.
 *
 * Use this method when you need to transform the value of an `AsyncResult`
 * value when it represents a success.
 *
 * @param transform A function that takes the success value of `result`.
 * @returns A function that takes a `SomeResult` value with the result of evaluating `transform` as
 *          the new success value if `result` represents a success.
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
 * transformation and unwrapping the produced async result.
 *
 * @param transform A function that takes the failure value of the `result`.
 * @param result Original `SomeResult`.
 * @returns An `AsyncResult` value, either from the function or the previous `success`.
 */
function flatMapError<
  NewFailure,
  Success,
  Failure,
  NewResultLike extends SomeResult<never, NewFailure> = SomeResult<never, NewFailure>,
  ResultLike extends SomeResult<Success, Failure> = SomeResult<Success, Failure>
>(
  transform: (failure: FailureOf<ResultLike>) => NewResultLike,
  result: ResultLike
): AsyncResult<SuccessOf<ResultLike>, FailureOf<NewResultLike>>

/**
 * Returns a new async result, mapping any failure value using the given
 * transformation and unwrapping the produced async result.
 *
 * @param transform A function that takes the failure value of the `result`.
 * @param result Original `SomeResult`.
 * @returns An `AsyncResult` value, either from the function or the previous `success`.
 */
function flatMapError<NewFailure, Success, Failure>(
  transform: (failure: Failure) => SomeResult<never, NewFailure>,
  result: SomeResult<Success, Failure>
): AsyncResult<Success, NewFailure>

/**
 * Returns a function that takes a new async result, mapping any failure value using the given
 * transformation and unwrapping the produced async result.
 *
 * @param transform A function that takes the failure value of the `result`.
 * @returns A function that takes a `SomeResult` value, either from the function or
 *          the previous`success`.
 */
function flatMapError<
  NewFailure,
  Success,
  Failure,
  NewResultLike extends SomeResult<never, NewFailure> = SomeResult<never, NewFailure>,
  ResultLike extends SomeResult<Success, Failure> = SomeResult<Success, Failure>
>(
  transform: (failure: FailureOf<ResultLike>) => NewResultLike
): (result: ResultLike) => AsyncResult<SuccessOf<ResultLike>, FailureOf<NewResultLike>>

function flatMapError<NewFailure, Success, Failure>(
  transform: (failure: Failure) => SomeResult<never, NewFailure>,
  result?: SomeResult<Success, Failure>
) {
  return result === undefined
    ? (r: SomeResult<Success, Failure>) => flatMapError(transform, r)
    : then(result, (r) => (isSuccess(r) ? r : transform(r.failure)))
}

/**
 * Returns a new async result, mapping any failure value using the given
 * transformation.
 *
 * Use this method when you need to transform the value of an `AsyncResult`
 * value when it represents a failure.
 *
 * @param transform A function that takes the failure value of the `result`.
 * @param result Original `SomeResult`.
 * @returns An `AsyncResult` value with the result of evaluating `transform` as the new failure
 *          value if `result` represents a failure.
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
 * Returns a new async result, mapping any failure value using the given
 * transformation.
 *
 * Use this method when you need to transform the value of an `AsyncResult`
 * value when it represents a failure.
 *
 * @param transform A function that takes the failure value of the `result`.
 * @param result Original `SomeResult`.
 * @returns An `AsyncResult` value with the result of evaluating `transform` as the new failure
 *          value if `result` represents a failure.
 */
function mapError<NewFailure, Success, Failure>(
  transform: (failure: Failure) => NewFailure,
  result: SomeResult<Success, Failure>
): AsyncResult<Success, NewFailure>

/**
 * Returns a function that takes an async result, mapping any failure value using the given
 * transformation.
 *
 * Use this method when you need to transform the value of an `AsyncResult`
 * value when it represents a failure.
 *
 * @param transform A function that takes the failure value of the `result`.
 * @returns A function that takes `SomeResult` value with the result of evaluating `transform` as
 *          the new failure value if `result` represents a failure.
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
 * Unwraps result and transforms success and failure values
 * or returns a default value if needed transform is not provided
 *
 * @param transform Success & failure transformers and default value
 * @returns A function that takes a `SomeResult` and returns a promise with transformed wrapped
 *          value or default value
 */
function match<ResultLike extends SomeResult, MatcherLike extends Matcher<ResultLike, unknown>>(
  transform: MatcherLike
): (
  result: ResultLike
) => MatcherLike extends Matcher<ResultLike, infer Match> ? Promise<Match> : never

/**
 * Unwraps result and transforms success and failure values
 * or returns a default value if needed transform is not provided
 *
 * @param transform Success & failure transformers and default value
 * @param result A `SomeResult` to unwrap
 * @returns A promise with transformed wrapped value or default value
 */
function match<ResultLike extends SomeResult, MatcherLike extends Matcher<ResultLike, unknown>>(
  transform: MatcherLike,
  result: ResultLike
): MatcherLike extends Matcher<ResultLike, infer Match> ? Promise<Match> : never

/**
 * Unwraps result and transforms success and failure values
 * or returns a default value if needed transform is not provided
 *
 * Additional siganture for generic results
 *
 * @param transform Success & failure transformers and default value
 * @returns A function that takes a `SomeResult` and returns a promise with transformed wrapped
 *          value or default value
 */
function match<
  ResultLike extends SomeResult,
  MatcherLike extends ResultMatcher<SuccessOf<ResultLike>, FailureOf<ResultLike>, unknown>
>(
  transform: MatcherLike,
  result: ResultLike
): MatcherLike extends Matcher<ResultLike, infer Match> ? Promise<Match> : never

/**
 * Unwraps result and transforms success and failure values
 * or returns a default value if needed transform is not provided
 *
 * Additional siganture for generic results
 *
 * @param transform Success & failure transformers and default value
 * @param result A `SomeResult` to unwrap
 * @returns A promise with transformed wrapped value or default value
 */
function match<
  ResultLike extends SomeResult,
  MatcherLike extends ResultMatcher<SuccessOf<ResultLike>, FailureOf<ResultLike>, unknown>
>(
  transform: MatcherLike
): (
  result: ResultLike
) => MatcherLike extends Matcher<ResultLike, infer Match> ? Promise<Match> : never

function match<Success, Failure, Match>(
  transform: Matcher<SomeResult<Success, Failure>, Match>,
  result?: SomeResult<Success, Failure>
) {
  return result === undefined
    ? (r: SomeResult<Success, Failure>) => match(transform, r)
    : then(
        result,
        (r) =>
          (isSuccess(r) ? transform.success?.(r.success) : transform.failure?.(r.failure)) ??
          transform.default
      )
}

/**
 * Combines multiple `SomeResult`s into single `AsyncResult`
 *
 * @param results `SomeResult`s to combine
 * @returns An `AsyncResult` that holds a tuple of successes or a single failure
 */
function combine<
  ResultLike extends SomeResult,
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
>(...results: Results): AsyncResult<Successes, Failure>

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
  ResultLike extends SomeResult,
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
  ? () => AsyncResult<Successes, Failure>
  : (args: Args) => AsyncResult<Successes, Failure>

function combine<Success, Failure, Arg, ResultLike extends SomeResult<Success, Failure>>(
  ...results: CombineArray<ResultLike> | CombineFunArray<Arg, ResultLike>
) {
  return isCombineFunArray(results)
    ? (args: CombineArray<Arg>) =>
        combine(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          ...results.map((r, i) => r(args?.[i]))
        )
    : results.reduce<SomeResult<readonly Success[], Failure>>(
        (acc, val) => flatMap((successes) => map((success) => [...successes, success], val), acc),
        createSuccess([])
      )
}

/**
 * Returns a new async result, mapping any success value using the given
 * transformation.
 *
 * Use this method when you need to transform the value of an `AsyncResult`
 * value when it represents a success.
 *
 * @param transform An async function that takes the success value of `result`.
 * @param result Original `SomeResult`.
 * @returns An `AsyncResult` value with the result of evaluating `transform` as the new success
 *          value if `result` represents a success.
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
 * Returns a new async result, mapping any success value using the given
 * transformation.
 *
 * Use this method when you need to transform the value of an `AsyncResult`
 * value when it represents a success.
 *
 * @param transform An async function that takes the success value of `result`.
 * @param result Original `SomeResult`.
 * @returns An `AsyncResult` value with the result of evaluating `transform` as the new success
 *          value if `result` represents a success.
 */
function mapAsync<NewSuccess, Success, Failure>(
  transform: (success: Success) => Promise<NewSuccess>,
  result: SomeResult<Success, Failure>
): AsyncResult<NewSuccess, Failure>

/**
 * Returns a function that takes a new async result, mapping any success value using the given
 * transformation.
 *
 * Use this method when you need to transform the value of an `AsyncResult`
 * value when it represents a success.
 *
 * @param transform An async function that takes the success value of `result`.
 * @returns A function that takes a `SomeResult` value with the result of evaluating `transform` as
 *          the new success value if `result` represents a success.
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
 * @param transform An async function that takes the failure value of the `result`.
 * @param result Original `SomeResult`.
 * @returns An `AsyncResult` value with the result of evaluating `transform` as the new failure
 *          value if `result` represents a failure.
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
 * Returns a new async result, mapping any failure value using the given
 * transformation.
 *
 * Use this method when you need to transform the value of an `AsyncResult`
 * value when it represents a failure.
 *
 * @param transform An async function that takes the failure value of the `result`.
 * @param result Original `SomeResult`.
 * @returns An `AsyncResult` value with the result of evaluating `transform` as the new failure
 *          value if `result` represents a failure.
 */
function mapErrorAsync<NewFailure, Success, Failure>(
  transform: (failure: Failure) => Promise<NewFailure>,
  result: SomeResult<Success, Failure>
): AsyncResult<Success, NewFailure>

/**
 * Returns a function that takes an async result, mapping any failure value using the given
 * transformation.
 *
 * Use this method when you need to transform the value of an `AsyncResult`
 * value when it represents a failure.
 *
 * @param transform An async function that takes the failure value of the `result`.
 * @returns A function that takes `SomeResult` value with the result of evaluating `transform` as
 *          the new failure value if `result` represents a failure.
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
  flatMapError,
  match,
  combine
} as const
