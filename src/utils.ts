import { FailureResult, SuccessResult, SomeResult, Result } from './types'

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

const syncThen = <Success, Failure, Out>(
  result: Result<Success, Failure>,
  transform: (r: Result<Success, Failure>) => Out
) => transform(result)

const asyncThen = <Success, Failure, Out>(
  result: SomeResult<Success, Failure>,
  transform: (r: Result<Success, Failure>) => Out
) => Promise.resolve(result).then(transform)

export function createThen(kind: 'sync'): typeof syncThen
export function createThen(kind: 'async'): typeof asyncThen

export function createThen(kind: 'sync' | 'async') {
  return kind === 'sync' ? syncThen : asyncThen
}

export type Then = typeof syncThen | typeof asyncThen
