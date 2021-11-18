## Result

These functions are synchronous. Mapping functions take `Result` and return transformed `Result`.

### Result.success

Creates `SuccessResult`.

```typescript
// Signature
type success = <Success>(success: Success) => SuccessResult<Success>

// Example
const result = Result.success(1)
expect(result).toEqual({ tag: 'success', success: 1 })
```

### Result.failure

Creates `FailureResult`.

```typescript
// Signature
type failure = <Failure>(failure: Failure) => FailureResult<Failure>

// Example
const result = Result.failure('test')
expect(result).toEqual({ tag: 'failure', failure: 'test' })
```

### Result.map

Returns a new `Result`, mapping any success value using the given transformation.

```typescript
// Simplified signatures
type map = {
  <NewSuccess, Success, Failure>(
    transform: (success: Success) => NewSuccess,
    result: Result<Success, Failure>
  ): Result<NewSuccess, Failure>

  <NewSuccess, Success, Failure>(transform: (success: Success) => NewSuccess): (
    result: Result<Success, Failure>
  ) => Result<NewSuccess, Failure>
}

// Example
const div = (a: number, b: number) /*: Result<number, 'div by zero'> */ =>
  b === 0 ? Result.failure('div by zero' as const) : Result.success(a / b)

const success = Result.map((value) => value * 2, div(10, 5))
expect(success).toEqual({ tag: 'success', success: 4 })

const failure = Result.map((value) => value * 2, div(10, 0))
expect(failure).toEqual({ tag: 'failure', failure: 'div by zero' })
```

### Result.mapError

Returns a new `Result`, mapping any failure value using the given transformation.

```typescript
// Simplified signatures
type mapError = {
  <NewFailure, Success, Failure>(
    transform: (failure: Failure) => NewFailure,
    result: Result<Success, Failure>
  ): Result<Success, NewFailure>

  <NewFailure, Success, Failure>(transform: (failure: Failure) => NewFailure): (
    result: Result<Success, Failure>
  ) => Result<Success, NewFailure>
}

// Example
const div = (a: number, b: number) /*: Result<number, 'div by zero'> */ =>
  b === 0 ? Result.failure('div by zero' as const) : Result.success(a / b)

const success = Result.mapError((error) => `Error: ${error}`, div(10, 5))
expect(success).toEqual({ tag: 'success', success: 2 })

const failure = Result.mapError((error) => `Error: ${error}`, div(10, 0))
expect(failure).toEqual({ tag: 'failure', failure: 'Error: div by zero' })
```

### Result.flatMap

Returns a new `Result`, mapping any success value using the given transformation and unwrapping the produced result.

```typescript
// Simplified signatures
type flatMap = {
  <NewSuccess, NewFailure, Success, Failure>(
    transform: (success: Success) => Result<NewSuccess, NewFailure>,
    result: Result<Success, Failure>
  ): Result<NewSuccess, NewFailure | Failure>

  <NewSuccess, NewFailure, Success, Failure>(
    transform: (success: Success) => Result<NewSuccess, NewFailure>
  ): (result: Result<Success, Failure>) => Result<NewSuccess, NewFailure | Failure>
}

// Example
const div = (a: number, b: number) /*: Result<number, 'div by zero'> */ =>
  b === 0 ? Result.failure('div by zero' as const) : Result.success(a / b)

const parseNumber = (maybeNumber: string) /*: Result<number, 'not a number'> */ => {
  const num = parseInt(maybeNumber)
  return isNaN(num) ? Result.failure('not a number' as const) : Result.success(num)
}

const success = Result.flatMap((value) => div(value, 5), parseNumber('10'))
expect(success).toEqual({ tag: 'success', success: 2 })

const failure = Result.flatMap((value) => div(value, 0), parseNumber('abc'))
expect(failure).toEqual({ tag: 'failure', failure: 'not a number' })
```

### Result.flatMapError

Returns a new `Result`, mapping any failure value using the given transformation and unwrapping the produced result.
In ROP paradigm once you got a failure you can't switch back to success path, this means that `transform` function can
only return failure.

```typescript
// Simplified signatures
type flatMapError = {
  <NewFailure, Success, Failure>(
    transform: (failure: Failure) => Result<never, NewFailure>,
    result: Result<Success, Failure>
  ): Result<Success, NewFailure>

  <NewFailure, Success, Failure>(transform: (failure: Failure) => Result<never, NewFailure>): (
    result: Result<Success, Failure>
  ) => Result<Success, NewFailure>
}

// Example
const div = (a: number, b: number) /*: Result<number, 'div by zero'> */ =>
  b === 0 ? Result.failure('div by zero' as const) : Result.success(a / b)

const parseNumber = (maybeNumber: string) /*: Result<number, 'not a number'> */ => {
  const num = parseInt(maybeNumber)
  return isNaN(num) ? Result.failure('not a number' as const) : Result.success(num)
}

const translateError = (error: string) =>
  Result.failure(
    error === 'div by zero' ? 'деление на ноль' : { translationError: `can't find error` }
  )

const success = Result.flatMapError(translateError, div(10, 0))
expect(success).toEqual({ tag: 'failure', failure: 'деление на ноль' })

const failure = Result.flatMapError(translateError, parseNumber('abc'))
expect(failure).toEqual({ tag: 'failure', failure: { translationError: `can't find error` } })
```

### Result.match

Unwraps `Result` and transforms success and failure values or returns a default value if needed transform is not provided.
Both `success` and `failure` case transforms are required unless `default` value provided or corresponding case has `never` type.

```typescript
// Simplified signatures
type match = {
  <Success, Failure, Match>(
    transform: {
      success: (value: Success) => Match
      failure: (error: Failure) => Match
    },
    result: Result<Success, Failure>
  ): Match

  <Success, Failure, Match>(transform: {
    success: (value: Success) => Match
    failure: (error: Failure) => Match
  }): (result: Result<Success, Failure>) => Match

  <Success, Failure, Match>(
    transform: {
      success?: (value: Success) => NonNullable<Match>
      failure?: (error: Failure) => NonNullable<Match>
      default: Match
    },
    result: Result<Success, Failure>
  ): Match

  <Success, Failure, Match>(transform: {
    success?: (value: Success) => NonNullable<Match>
    failure?: (error: Failure) => NonNullable<Match>
    default: Match
  }): (result: Result<Success, Failure>) => Match

  <Failure, Match>(
    transform: {
      failure: (error: Failure) => Match
    },
    result: Result<never, Failure>
  ): Match

  <Failure, Match>(transform: { failure: (error: Failure) => Match }): (
    result: Result<never, Failure>
  ) => Match

  <Success, Match>(
    transform: {
      success: (value: Success) => Match
    },
    result: Result<Success, never>
  ): Match

  <Success, Match>(transform: { success: (value: Success) => Match }): (
    result: Result<Success, never>
  ) => Match
}

// Example
const div = (a: number, b: number) /*: Result<number, 'div by zero'> */ =>
  b === 0 ? Result.failure('div by zero' as const) : Result.success(a / b)

const matcher = {
  success: (value: number) => `success is ${value}`,
  failure: (error: string) => `failure is ${error}`
}

const success = Result.match(matcher, div(10, 1))
expect(success).toEqual('success is 10')

const failure = Result.match(matcher, div(10, 0))
expect(failure).toEqual('failure is div by zero')
```

### Result.combine

Combines multiple `Result`s into single one. This function has two signatures: the first one combines
a list of results into single result `[Result<S1, F1>, Result<S2, F2>, ...] => Result<[S1, S2, ...], F1 | F2 | ...>`
and the second one combines a list of functions where each function takes 0-1 arguments and returns a result into
a function that takes a list of arguments and returns a result
`[() => Result<S1, F1>, (arg: Arg2) => Result<S2, F2>, ...] => (args: [undefined, Arg2, ...]) => Result<[S1, S2, ...], F1 | F2 | ...>`,
if all functions have 0 arguments then combined function also will have 0 arguments
`[() => Result<S1, F1>, () => Result<S2, F2>] => () => Result<[S1, S2], F1 | F2>`.

```typescript
// Simplified signatures
type combine = {
  <Results, Successes, Failure>(...results: Results): Result<Successes, Failure>

  <Results, Args, Successes, Failure>(...results: Results): Args extends Array<undefined>
    ? () => Result<Successes, Failure>
    : (args: Args) => Result<Successes, Failure>
}

// Example
const success = Result.combine(Result.success(1), Result.success('success'))
expect(success).toEqual(Result.success([1, 'success']))

const failure = Result.combine(Result.success(1), Result.failure('failure'))
expect(failure).toEqual(Result.failure('failure'))

const foo = Result.combine(
  (num: number) => Result.success(num),
  (str: string) => Result.success(str)
)

expect(foo([123, 'test'])).toEqual(Result.success([123, 'test']))

const bar = Result.combine(
  () => Result.success(321),
  () => Result.success('abc')
)

expect(bar()).toEqual(Result.success([321, 'abc']))
```
