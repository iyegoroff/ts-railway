export type SuccessResult<Success> = {
  readonly tag: 'success'
  readonly success: Success
}

export type FailureResult<Failure> = {
  readonly tag: 'failure'
  readonly failure: Failure
}

/** A value that represents either a success or a failure, including an associated value in each case. */
export type Result<Success = unknown, Failure = unknown> =
  | SuccessResult<Success>
  | FailureResult<Failure>

/**
 * An async value that represents either a success or a failure,
 * including an associated value in each case.
 * */
export type AsyncResult<Success = unknown, Failure = unknown> = Promise<Result<Success, Failure>>

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

export type ResultMatcher<R extends SomeResult, U = unknown> = readonly [
  SuccessOf<R>,
  FailureOf<R>
] extends readonly [never, never]
  ? {
      readonly success?: never
      readonly failure?: never
    }
  : FailureOf<R> extends never
  ? {
      readonly success: (success: SuccessOf<R>) => U
      readonly failure?: never
    }
  : SuccessOf<R> extends never
  ? {
      readonly success?: never
      readonly failure: (failure: FailureOf<R>) => U
    }
  : {
      readonly success: (success: SuccessOf<R>) => U
      readonly failure: (failure: FailureOf<R>) => U
    }
