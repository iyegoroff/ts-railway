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

type SuccessResultMatcher<Success, Match> = {
  readonly success: (success: Success) => Match
  readonly failure?: never
  readonly default?: never
}

type FailureResultMatcher<Failure, Match> = {
  readonly failure: (failure: Failure) => Match
  readonly success?: never
  readonly default?: never
}

export type ResultMatcher<Success, Failure, Match> =
  | {
      readonly success: (success: Success) => Match
      readonly failure: (failure: Failure) => Match
      readonly default?: never
    }
  | {
      readonly success?: (success: Success) => NonNullable<Match>
      readonly failure?: (failure: Failure) => NonNullable<Match>
      readonly default: Match
    }

export type Matcher<R extends SomeResult, Match> = FailureOf<R> extends never
  ? SuccessResultMatcher<SuccessOf<R>, Match>
  : SuccessOf<R> extends never
  ? FailureResultMatcher<FailureOf<R>, Match>
  : ResultMatcher<SuccessOf<R>, FailureOf<R>, Match>

export type CombineArray<T> = readonly T[]
export type CombineFunArray<Arg, Return> = CombineArray<(arg: Arg) => Return>

export type HasNever<T1 = unknown, T2 = unknown, T3 = unknown, T4 = unknown> = T1 extends never
  ? true
  : T2 extends never
  ? true
  : T3 extends never
  ? true
  : T4 extends never
  ? true
  : false
