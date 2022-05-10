import {
  FailureResult,
  SuccessResult,
  SomeResult,
  Result,
  CombineFunArray,
  CombineArray
} from './types.js'

/** A success, storing a `Success` value. */
export const createSuccess = <Success>(success: Success): SuccessResult<Success> => ({
  tag: 'success',
  success
})

/** A failure, storing a `Failure` value. */
export const createFailure = <Failure>(failure: Failure): FailureResult<Failure> => ({
  tag: 'failure',
  failure
})

export const isSuccess = <Success, Failure>(
  result: Result<Success, Failure>
): result is SuccessResult<Success> => result.tag === 'success'

export const isCombineFunArray = <T, Arg, Return>(
  array: CombineArray<T> | CombineFunArray<Arg, Return>
): array is CombineFunArray<Arg, Return> => typeof array[0] === 'function'

export const syncThen = <Success, Failure, Out>(
  result: Result<Success, Failure>,
  transform: (r: Result<Success, Failure>) => Out
) => transform(result)

export const asyncThen = <Success, Failure, Out>(
  result: SomeResult<Success, Failure>,
  transform: (r: Result<Success, Failure>) => Out
) => Promise.resolve(result).then(transform)

export const swap = <Success, Failure>(result: Result<Success, Failure>) =>
  isSuccess(result) ? createFailure(result.success) : createSuccess(result.failure)

export type SyncThen = typeof syncThen
export type AsyncThen = typeof asyncThen
