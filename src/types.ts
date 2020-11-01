import { Result, SuccessResult, FailureResult } from './result'
import { AsyncResult } from './async-result'

export type SomeResult<Success = unknown, Failure = unknown> =
  | Result<Success, Failure>
  | AsyncResult<Success, Failure>

/** Infers type of 'failure' value */
export type FailureOf<R extends SomeResult> = R extends Promise<infer AR>
  ? AR extends FailureResult<infer Failure>
    ? Failure
    : never
  : R extends FailureResult<infer Failure>
  ? Failure
  : never

/** Infers type of 'success' value */
export type SuccessOf<R extends SomeResult> = R extends Promise<infer AR>
  ? AR extends SuccessResult<infer Success>
    ? Success
    : never
  : R extends SuccessResult<infer Success>
  ? Success
  : never

export type UnwrapResult<R extends SomeResult, U = unknown> = {
  readonly success: (success: SuccessOf<R>) => U
  readonly failure: (failure: FailureOf<R>) => U
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
      ? SuccessOf<Results[Index]>
      : never
  },
  Failure = {
    readonly [Index in keyof Results]: Results[Index] extends ResultLike
      ? FailureOf<Results[Index]>
      : never
  }[Shape extends 'tuple' ? number : keyof Results]
> = Exec extends 'result' ? Result<Success, Failure> : AsyncResult<Success, Failure>
