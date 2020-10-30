import { Result } from './result'
import { AsyncResult } from './async-result'

export type SomeResult<Success = unknown, Failure = unknown> =
  | Result<Success, Failure>
  | AsyncResult<Success, Failure>

/** Infers type of 'failure' value */
export type FailureCase<R extends SomeResult> = R extends Promise<infer AR>
  ? AR extends Result<unknown, unknown>
    ? AR extends { readonly tag: 'failure' }
      ? AR['failure']
      : never
    : never
  : R extends Result<unknown, unknown>
  ? R extends { readonly tag: 'failure' }
    ? R['failure']
    : never
  : never

/** Infers type of 'success' value */
export type SuccessCase<R extends SomeResult> = R extends Promise<infer AR>
  ? AR extends Result<unknown, unknown>
    ? AR extends { readonly tag: 'success' }
      ? AR['success']
      : never
    : never
  : R extends Result<unknown, unknown>
  ? R extends { readonly tag: 'success' }
    ? R['success']
    : never
  : never

export type UnwrapResult<R extends SomeResult, U = unknown> = {
  readonly success: (success: SuccessCase<R>) => U
  readonly failure: (failure: FailureCase<R>) => U
}

export type CombinedResult<
  Exec extends 'async-result' | 'result',
  Shape extends 'tuple' | 'map',
  ResultLike extends SomeResult,
  Results extends Shape extends 'map'
    ? { readonly [key: string]: ResultLike }
    : readonly [ResultLike, ...(readonly ResultLike[])],
  Success = {
    readonly [Index in keyof Results]: Results[Index] extends ResultLike
      ? SuccessCase<Results[Index]>
      : never
  },
  Failure = {
    readonly [Index in keyof Results]: Results[Index] extends ResultLike
      ? FailureCase<Results[Index]>
      : never
  }[Shape extends 'tuple' ? number : keyof Results]
> = Exec extends 'result' ? Result<Success, Failure> : AsyncResult<Success, Failure>
