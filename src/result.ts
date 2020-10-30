import { SuccessCase, FailureCase, CombinedResult } from './types'

/** A value that represents either a success or a failure, including an associated value in each case. */
export type Result<Success = unknown, Failure = unknown> =
  | { readonly tag: 'success'; readonly success: Success }
  | { readonly tag: 'failure'; readonly failure: Failure }

/** A success, storing a `Success` value. */
function createSuccess<Success>(value: Success): Result<Success, never> {
  return {
    tag: 'success',
    success: value
  }
}

/** A failure, storing a `Failure` value. */
function createFailure<Failure>(value: Failure): Result<never, Failure> {
  return {
    tag: 'failure',
    failure: value
  }
}

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
  transform: (success: SuccessCase<ResultLike>) => NewResultLike,
  result: ResultLike
): Result<SuccessCase<NewResultLike>, FailureCase<NewResultLike | ResultLike>>

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
  transform: (success: SuccessCase<ResultLike>) => NewResultLike
): (
  result: ResultLike
) => Result<SuccessCase<NewResultLike>, FailureCase<NewResultLike | ResultLike>>

function flatMap<NewSuccess, NewFailure, Success, Failure>(
  transform: (success: Success) => Result<NewSuccess, NewFailure>,
  result?: Result<Success, NewFailure | Failure>
) {
  return result === undefined
    ? (r: Result<Success, Failure>) => flatMap(transform, r)
    : result.tag === 'success'
    ? transform(result.success)
    : result
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
  transform: (success: SuccessCase<ResultLike>) => NewSuccess,
  result: ResultLike
): Result<NewSuccess, FailureCase<ResultLike>>

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
  transform: (success: SuccessCase<ResultLike>) => NewSuccess
): (result: ResultLike) => Result<NewSuccess, FailureCase<ResultLike>>

function map<NewSuccess, Success, Failure>(
  transform: (success: Success) => NewSuccess,
  result?: Result<Success, Failure>
) {
  return result === undefined
    ? flatMap<NewSuccess, Failure, Success, Failure>((value) => createSuccess(transform(value)))
    : flatMap((value) => createSuccess(transform(value)), result)
}

/**
 * Returns a new result, mapping any failure value using the given
 * transformation and unwrapping the produced result.
 *
 * @param transform A closure that takes the failure value of the `result`.
 * @param result Original `Result`.
 * @returns A `Result` value, either from the closure or the previous `success`.
 */
function flatMapError<
  NewFailure,
  Success,
  Failure,
  NewResultLike extends Result<never, NewFailure> = Result<never, NewFailure>,
  ResultLike extends Result<Success, Failure> = Result<Success, Failure>
>(
  transform: (failure: FailureCase<ResultLike>) => NewResultLike,
  result: ResultLike
): Result<SuccessCase<ResultLike>, FailureCase<NewResultLike>>

/**
 * Returns a closure that takes a new result, mapping any failure value using the given
 * transformation and unwrapping the produced result.
 *
 * @param transform A closure that takes the failure value of the `result`.
 * @returns A closure that takes a `Result` value, either from the closure or the previous `success`.
 */
function flatMapError<
  NewFailure,
  Success,
  Failure,
  NewResultLike extends Result<never, NewFailure> = Result<never, NewFailure>,
  ResultLike extends Result<Success, Failure> = Result<Success, Failure>
>(
  transform: (failure: FailureCase<ResultLike>) => NewResultLike
): (result: ResultLike) => Result<SuccessCase<ResultLike>, FailureCase<NewResultLike>>

function flatMapError<NewFailure, Success, Failure>(
  transform: (failure: Failure) => Result<never, NewFailure>,
  result?: Result<Success, Failure>
) {
  return result === undefined
    ? (r: Result<Success, Failure>) => flatMapError(transform, r)
    : result.tag === 'success'
    ? result
    : transform(result.failure)
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
  transform: (failure: FailureCase<ResultLike>) => NewFailure,
  result: ResultLike
): Result<SuccessCase<ResultLike>, NewFailure>

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
  transform: (failure: FailureCase<ResultLike>) => NewFailure
): (result: ResultLike) => Result<SuccessCase<ResultLike>, NewFailure>

function mapError<NewFailure, Success, Failure>(
  transform: (failure: Failure) => NewFailure,
  result?: Result<Success, Failure>
) {
  return result === undefined
    ? flatMapError<NewFailure, Success, Failure>((value: Failure) =>
        createFailure(transform(value))
      )
    : flatMapError((value) => createFailure(transform(value)), result)
}

/**
 * Extracts wrapped value from result
 *
 * @returns A closure that takes an `Result` and returns wrapped value
 */
function unwrap<
  Success,
  Failure,
  ResultLike extends Result<Success, Failure> = Result<Success, Failure>
>(): (result: ResultLike) => SuccessCase<ResultLike> | FailureCase<ResultLike>

/**
 * Extracts wrapped value from result and transforms success and failure cases
 *
 * @param transform Success & failure transformers
 * @returns A closure that takes a `Result` and returns transformed wrapped value
 */
function unwrap<
  Success,
  Failure,
  UnwrapSuccess,
  UnwrapFailure,
  ResultLike extends Result<Success, Failure> = Result<Success, Failure>
>(transform: {
  readonly success: (val: SuccessCase<ResultLike>) => UnwrapSuccess
  readonly failure: (val: FailureCase<ResultLike>) => UnwrapFailure
}): (result: ResultLike) => UnwrapSuccess | UnwrapFailure

/**
 * Extracts wrapped value from result and transforms failure case
 * or returns success value as is
 *
 * @param transform Failure transformer
 * @returns A closure that takes a `Result` and returns transformed wrapped value
 */
function unwrap<
  Success,
  Failure,
  UnwrapFailure,
  ResultLike extends Result<Success, Failure> = Result<Success, Failure>
>(transform: {
  readonly failure: (val: FailureCase<ResultLike>) => UnwrapFailure
}): (result: ResultLike) => SuccessCase<ResultLike> | UnwrapFailure

/**
 * Extracts wrapped value from result and transforms success case
 * or returns failure value as is
 *
 * @param transform Success transformer
 * @returns A closure that takes a `Result` and returns transformed wrapped value
 */
function unwrap<
  Success,
  Failure,
  UnwrapSuccess,
  ResultLike extends Result<Success, Failure> = Result<Success, Failure>
>(transform: {
  readonly success: (val: SuccessCase<ResultLike>) => UnwrapSuccess
}): (result: ResultLike) => UnwrapSuccess | FailureCase<ResultLike>

function unwrap<Success, Failure, UnwrapSuccess, UnwrapFailure>(transform?: {
  readonly success?: (val: Success) => UnwrapSuccess
  readonly failure?: (val: Failure) => UnwrapFailure
}) {
  return (result: Result<Success, Failure>) =>
    result.tag === 'success'
      ? transform?.success?.(result.success) ?? result.success
      : transform?.failure?.(result.failure) ?? result.failure
}

/**
 * Combines multiple results into single one
 *
 * @param results `Result`s to combine
 * @returns A `Result` that holds a tuple of `results` successes or a single failure
 */
function combine<
  ResultLike extends Result,
  TupleResults extends readonly [ResultLike, ResultLike, ...(readonly ResultLike[])]
>(...results: TupleResults): CombinedResult<'result', 'tuple', ResultLike, TupleResults>

/**
 * Combines multiple closures that take one argument and return result into single one
 *
 * @param results Closures to combine
 * @returns A closure that takes one argument and returns a `Result` that holds a tuple of `results` successes or a single failure
 */
function combine<
  ResultLike extends Result,
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
  'result',
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
  ResultLike extends Result,
  MapResults extends Readonly<Record<string, ResultLike>>
>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  ...results: {} extends MapResults ? never : readonly [MapResults]
): CombinedResult<'result', 'map', ResultLike, MapResults>

/**
 * Combines multiple closures that take one argument and return result into single one
 *
 * @param results Closures to combine
 * @returns A closure that takes one argument and returns a `Result` that holds an object map of `results` successes or a single failure
 */
function combine<
  ResultLike extends Result,
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
  'result',
  'map',
  ResultLike,
  {
    readonly [Index in keyof FunResults]: FunResults[Index] extends FunResultLike
      ? ReturnType<FunResults[Index]>
      : never
  }
>

function combine<
  ResultLike extends Result,
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
  ResultLike extends Result,
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
    'result',
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
  ResultLike extends Result,
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
    'result',
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
const combineIter = <ResultLike extends Result>(
  results: readonly ResultLike[],
  successes: ReadonlyArray<SuccessCase<ResultLike>>
): Result<ReadonlyArray<SuccessCase<ResultLike>>, FailureCase<ResultLike>> =>
  results.length === 1
    ? map((success) => [...successes, success], results[0])
    : flatMap((success) => combineIter(results.slice(1), [...successes, success]), results[0])

export const Result = {
  success: createSuccess,
  failure: createFailure,
  map,
  flatMap,
  mapError,
  flatMapError,
  unwrap,
  combine
} as const
