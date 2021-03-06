import { Result } from './result'
import { SuccessOf, FailureOf, SomeResult, CombinedResult } from './types'

/**
 * An async value that represents either a success or a failure,
 * including an associated value in each case.
 * */
export type AsyncResult<Success = unknown, Failure = unknown> = Promise<Result<Success, Failure>>

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
    : Promise.resolve(result).then((r) => (r.tag === 'success' ? transform(r.success) : r))
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
    ? flatMap<NewSuccess, Failure, Success, Failure>((value) => Result.success(transform(value)))
    : flatMap((value) => Result.success(transform(value)), result)
}
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
    ? flatMap<NewSuccess, Failure, Success, Failure>((value) =>
        transform(value).then(Result.success)
      )
    : flatMap((value) => transform(value).then(Result.success), result)
}

/**
 * Returns a new async result, mapping any failure value using the given
 * transformation and unwrapping the produced async result.
 *
 * @param transform A closure that takes the failure value of the `result`.
 * @param result Original `AsyncResult` or `Result`.
 * @returns An `AsyncResult` value, either from the closure or the previous `success`.
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
 * Returns a closure that takes a new async result, mapping any failure value using the given
 * transformation and unwrapping the produced async result.
 *
 * @param transform A closure that takes the failure value of the `result`.
 * @returns A closure that takes an `AsyncResult` or `Result` value, either from the closure or the previous `success`.
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
    : Promise.resolve(result).then((r) => (r.tag === 'failure' ? transform(r.failure) : r))
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
    ? flatMapError<NewFailure, Success, Failure>((value: Failure) =>
        Result.failure(transform(value))
      )
    : flatMapError((value) => Result.failure(transform(value)), result)
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
    ? flatMapError<NewFailure, Success, Failure>((value: Failure) =>
        transform(value).then(Result.failure)
      )
    : flatMapError((value) => transform(value).then(Result.failure), result)
}

/**
 * Extracts wrapped value from async result
 *
 * @returns A closure that takes an `AsyncResult` and returns wrapped value
 */
function unwrap<
  Success,
  Failure,
  ResultLike extends AsyncResult<Success, Failure> = AsyncResult<Success, Failure>
>(): (result: ResultLike) => Promise<SuccessOf<ResultLike> | FailureOf<ResultLike>>

/**
 * Extracts wrapped value from async result and transforms success and failure cases
 *
 * @param transform Success & failure transformers
 * @returns A closure that takes an `AsyncResult` and returns transformed wrapped value
 */
function unwrap<
  Success,
  Failure,
  UnwrapSuccess,
  UnwrapFailure,
  ResultLike extends AsyncResult<Success, Failure> = AsyncResult<Success, Failure>
>(transform: {
  readonly success: (val: SuccessOf<ResultLike>) => UnwrapSuccess
  readonly failure: (val: FailureOf<ResultLike>) => UnwrapFailure
}): (result: ResultLike) => Promise<UnwrapSuccess | UnwrapFailure>

/**
 * Extracts wrapped value from async result and transforms failure case
 * or returns success value as is
 *
 * @param transform Failure transformer
 * @returns A closure that takes an `AsyncResult` and returns transformed wrapped value
 */
function unwrap<
  Success,
  Failure,
  UnwrapFailure,
  ResultLike extends AsyncResult<Success, Failure> = AsyncResult<Success, Failure>
>(transform: {
  readonly failure: (val: FailureOf<ResultLike>) => UnwrapFailure
}): (result: ResultLike) => Promise<SuccessOf<ResultLike> | UnwrapFailure>

/**
 * Extracts wrapped value from async result and transforms success case
 * or returns failure value as is
 *
 * @param transform Success transformer
 * @returns A closure that takes an `AsyncResult` and returns transformed wrapped value
 */
function unwrap<
  Success,
  Failure,
  UnwrapSuccess,
  ResultLike extends AsyncResult<Success, Failure> = AsyncResult<Success, Failure>
>(transform: {
  readonly success: (val: SuccessOf<ResultLike>) => UnwrapSuccess
}): (result: ResultLike) => Promise<UnwrapSuccess | FailureOf<ResultLike>>

function unwrap<Success, Failure, UnwrapSuccess, UnwrapFailure>(transform?: {
  readonly success?: (val: Success) => UnwrapSuccess
  readonly failure?: (val: Failure) => UnwrapFailure
}) {
  return (result: AsyncResult<Success, Failure>) =>
    result.then((r) =>
      r.tag === 'success'
        ? transform?.success?.(r.success) ?? r.success
        : transform?.failure?.(r.failure) ?? r.failure
    )
}

/**
 * Combines multiple results into single one
 *
 * @param results `Result`s to combine
 * @returns A `Result` that holds a tuple of `results` successes or a single failure
 */
function combine<
  ResultLike extends SomeResult,
  TupleResults extends readonly [ResultLike, ResultLike, ...(readonly ResultLike[])]
>(...results: TupleResults): CombinedResult<'async-result', 'tuple', ResultLike, TupleResults>

/**
 * Combines multiple closures that take one argument and return result into single one
 *
 * @param results Closures to combine
 * @returns A closure that takes one argument and returns a `Result` that holds a tuple of `results` successes or a single failure
 */
function combine<
  ResultLike extends SomeResult,
  FunResultLike extends (arg: never) => ResultLike,
  FunResults extends readonly [FunResultLike, FunResultLike, ...(readonly FunResultLike[])]
>(
  ...results: FunResults
): (
  args: {
    readonly [Index in keyof FunResults]: FunResults[Index] extends FunResultLike
      ? Parameters<FunResults[Index]>[0]
      : never
  }
) => CombinedResult<
  'async-result',
  'tuple',
  ResultLike,
  {
    readonly [Index in keyof FunResults]: FunResults[Index] extends FunResultLike
      ? ReturnType<FunResults[Index]>
      : never
  }
>

/**
 * Combines multiple results into single one
 *
 * @param results Object map of `Result`s to combine
 * @returns A `Result` that holds an object map of `results` successes or a single failure
 */
function combine<
  ResultLike extends SomeResult,
  MapResults extends Readonly<Record<string, ResultLike>>
>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  ...results: {} extends MapResults ? never : readonly [MapResults]
): CombinedResult<'async-result', 'map', ResultLike, MapResults>

/**
 * Combines multiple closures that take one argument and return result into single one
 *
 * @param results Closures to combine
 * @returns A closure that takes one argument and returns a `Result` that holds an object map of `results` successes or a single failure
 */
function combine<
  ResultLike extends SomeResult,
  FunResultLike extends (arg: never) => ResultLike,
  FunResults extends Readonly<Record<string, FunResultLike>>
>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  ...results: {} extends FunResults ? never : readonly [FunResults]
): (
  arg: {
    readonly [Index in keyof FunResults]: FunResults[Index] extends FunResultLike
      ? Parameters<FunResults[Index]>[0]
      : never
  }
) => CombinedResult<
  'async-result',
  'map',
  ResultLike,
  {
    readonly [Index in keyof FunResults]: FunResults[Index] extends FunResultLike
      ? ReturnType<FunResults[Index]>
      : never
  }
>

function combine<
  ResultLike extends SomeResult,
  FunResultLike extends (arg: never) => ResultLike,
  TupleResults extends readonly [ResultLike, ResultLike, ...(readonly ResultLike[])],
  TupleFunResults extends readonly [FunResultLike, FunResultLike, ...(readonly FunResultLike[])],
  MapResults extends Readonly<Record<string, ResultLike>>,
  MapFunResults extends Readonly<Record<string, FunResultLike>>
>(...results: TupleResults | readonly [MapResults] | TupleFunResults | readonly [MapFunResults]) {
  function isTupleFunResults(value: typeof results): value is TupleFunResults {
    return value.length > 1 && typeof value[0] === 'function'
  }

  function isTupleResults(
    value: TupleResults | readonly [MapResults] | readonly [MapFunResults]
  ): value is TupleResults {
    return value.length > 1
  }

  function isMapFunResults(
    value: readonly [MapResults] | readonly [MapFunResults]
  ): value is readonly [MapFunResults] {
    const [maybeMap] = value
    const firstKey = Object.keys(maybeMap)[0]
    return firstKey !== undefined && typeof maybeMap[firstKey] === 'function'
  }

  if (isTupleFunResults(results)) {
    return combineFunTuple(results)
  }

  if (isTupleResults(results)) {
    return combineIter(results, [])
  }

  if (isMapFunResults(results)) {
    return combineFunMap(results)
  }

  const [resultMap] = results
  const keys = Object.keys(resultMap)

  return map(
    (rs) => keys.reduce((acc, val, idx) => ({ ...acc, [val]: rs[idx] }), {}),
    combineIter(
      keys.map((key) => resultMap[key]),
      []
    )
  )
}

/** @hidden */
function combineFunTuple<
  ResultLike extends SomeResult,
  FunResultLike extends (arg: never) => ResultLike,
  FunResults extends readonly [FunResultLike, FunResultLike, ...(readonly FunResultLike[])]
>(funResults: FunResults) {
  return (
    args: {
      readonly [Index in keyof FunResults]: FunResults[Index] extends FunResultLike
        ? Parameters<FunResults[Index]>[0]
        : never
    }
  ): CombinedResult<
    'async-result',
    'tuple',
    ResultLike,
    {
      readonly [Index in keyof FunResults]: FunResults[Index] extends FunResultLike
        ? ReturnType<FunResults[Index]>
        : never
    }
  > => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return combine(...args.map((arg, i) => funResults[i](arg)))
  }
}

/** @hidden */
function combineFunMap<
  ResultLike extends SomeResult,
  FunResultLike extends (arg: never) => ResultLike,
  FunResults extends Readonly<Record<string, FunResultLike>>
>(funResults: readonly [FunResults]) {
  return (
    arg: {
      readonly [Index in keyof FunResults]: FunResults[Index] extends FunResultLike
        ? Parameters<FunResults[Index]>[0]
        : never
    }
  ): CombinedResult<
    'async-result',
    'map',
    ResultLike,
    {
      readonly [Index in keyof FunResults]: FunResults[Index] extends FunResultLike
        ? ReturnType<FunResults[Index]>
        : never
    }
  > => {
    const [funResult] = funResults
    const keys = Object.keys(funResult)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return combine(keys.reduce((acc, key) => ({ ...acc, [key]: funResult[key](arg[key]) }), {}))
  }
}

/** @hidden */
const combineIter = <ResultLike extends SomeResult>(
  results: readonly ResultLike[],
  successes: ReadonlyArray<SuccessOf<ResultLike>>
): SomeResult<ReadonlyArray<SuccessOf<ResultLike>>, FailureOf<ResultLike>> =>
  results.length === 1
    ? map((success) => [...successes, success], results[0])
    : flatMap((success) => combineIter(results.slice(1), [...successes, success]), results[0])

export const AsyncResult = {
  map,
  mapAsync,
  flatMap,
  mapError,
  mapErrorAsync,
  flatMapError,
  unwrap,
  combine
} as const
