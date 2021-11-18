## AsyncResult

These functions are asynchronous. Mapping functions take `SomeResult` and return transformed `AsyncResult`.

### AsyncResult.map

Returns a new `AsyncResult`, mapping any success value using the given transformation.

```typescript
// Simplified signatures
type map = {
  <NewSuccess, Success, Failure>(
    transform: (success: Success) => NewSuccess,
    result: SomeResult<Success, Failure>
  ): AsyncResult<NewSuccess, Failure>

  <NewSuccess, Success, Failure>(transform: (success: Success) => NewSuccess): (
    result: SomeResult<Success, Failure>
  ) => AsyncResult<NewSuccess, Failure>
}

// Example
const div = (a: number, b: number) =>
  Promise.resolve(b === 0 ? Result.failure('div by zero' as const) : Result.success(a / b))

const success = await AsyncResult.map((value) => value * 2, div(10, 5))
expect(success).toEqual({ tag: 'success', success: 4 })

const failure = await AsyncResult.map((value) => value * 2, div(10, 0))
expect(failure).toEqual({ tag: 'failure', failure: 'div by zero' })
```

### AsyncResult.mapError

Returns a new `AsyncResult`, mapping any failure value using the given transformation.

```typescript
// Simplified signatures
type mapError = {
  <NewFailure, Success, Failure>(
    transform: (failure: Failure) => NewFailure,
    result: SomeResult<Success, Failure>
  ): AsyncResult<Success, NewFailure>

  <NewFailure, Success, Failure>(transform: (failure: Failure) => NewFailure): (
    result: SomeResult<Success, Failure>
  ) => AsyncResult<Success, NewFailure>
}

// Example
const div = (a: number, b: number) /*: AsyncResult<number, 'div by zero'> */ =>
  Promise.resolve(b === 0 ? Result.failure('div by zero' as const) : Result.success(a / b))

const success = await AsyncResult.mapError((error) => `Error: ${error}`, div(10, 5))
expect(success).toEqual({ tag: 'success', success: 2 })

const failure = await AsyncResult.mapError((error) => `Error: ${error}`, div(10, 0))
expect(failure).toEqual({ tag: 'failure', failure: 'Error: div by zero' })
```

### AsyncResult.flatMap

Returns a new `AsyncResult`, mapping any success value using the given transformation and unwrapping the produced result.

```typescript
// Simplified signatures
type flatMap = {
  <NewSuccess, NewFailure, Success, Failure>(
    transform: (success: Success) => SomeResult<NewSuccess, NewFailure>,
    result: SomeResult<Success, Failure>
  ): AsyncResult<NewSuccess, NewFailure | Failure>

  <NewSuccess, NewFailure, Success, Failure>(
    transform: (success: Success) => SomeResult<NewSuccess, NewFailure>
  ): (result: SomeResult<Success, Failure>) => AsyncResult<NewSuccess, NewFailure | Failure>
}

// Example
const div = (a: number, b: number) /*: AsyncResult<number, 'div by zero'> */ =>
  Promise.resolve(b === 0 ? Result.failure('div by zero' as const) : Result.success(a / b))

const parseNumber = (maybeNumber: string) /*: Result<number, 'not a number'> */ => {
  const num = parseInt(maybeNumber)
  return isNaN(num) ? Result.failure('not a number' as const) : Result.success(num)
}

const success = await AsyncResult.flatMap((value) => div(value, 5), parseNumber('10'))
expect(success).toEqual({ tag: 'success', success: 2 })

const failure = await AsyncResult.flatMap((value) => div(value, 0), parseNumber('abc'))
expect(failure).toEqual({ tag: 'failure', failure: 'not a number' })
```

### AsyncResult.flatMapError

Returns a new `AsyncResult`, mapping any failure value using the given transformation and unwrapping the produced result.
In ROP paradigm once you got a failure you can't switch back to success path, this means that `transform` function can
only return failure.

```typescript
// Simplified signatures
type flatMapError = {
  <NewFailure, Success, Failure>(
    transform: (failure: Failure) => SomeResult<never, NewFailure>,
    result: SomeResult<Success, Failure>
  ): AsyncResult<Success, NewFailure>

  <NewFailure, Success, Failure>(transform: (failure: Failure) => SomeResult<never, NewFailure>): (
    result: SomeResult<Success, Failure>
  ) => AsyncResult<Success, NewFailure>
}

// Example
const div = (a: number, b: number) /*: AsyncResult<number, 'div by zero'> */ =>
  Promise.resolve(b === 0 ? Result.failure('div by zero' as const) : Result.success(a / b))

const parseNumber = (maybeNumber: string) /*: Result<number, 'not a number'> */ => {
  const num = parseInt(maybeNumber)
  return isNaN(num) ? Result.failure('not a number' as const) : Result.success(num)
}

const translateError = (error: string) =>
  Result.failure(
    error === 'div by zero' ? 'деление на ноль' : { translationError: `can't find error` }
  )

const success = await AsyncResult.flatMapError(translateError, div(10, 0))
expect(success).toEqual({ tag: 'failure', failure: 'деление на ноль' })

const failure = await AsyncResult.flatMapError(translateError, parseNumber('abc'))
expect(failure).toEqual({ tag: 'failure', failure: { translationError: `can't find error` } })
```

### AsyncResult.mapAsync

Returns a new `AsyncResult`, mapping any success value using the given transformation and unwrapping the produced `Promise`.

```typescript
// Simplified signatures
type mapAsync = {
  <NewSuccess, Success, Failure>(
    transform: (success: Success) => Promise<NewSuccess>,
    result: SomeResult<Success, Failure>
  ): AsyncResult<NewSuccess, Failure>

  <NewSuccess, Success, Failure>(transform: (success: Success) => Promise<NewSuccess>): (
    result: SomeResult<Success, Failure>
  ) => AsyncResult<NewSuccess, Failure>
}

// Example
const div = (a: number, b: number) =>
  Promise.resolve(b === 0 ? Result.failure('div by zero' as const) : Result.success(a / b))

const success = await AsyncResult.mapAsync((value) => div(6, value), div(10, 5))
expect(success).toEqual({ tag: 'success', success: 3 })

const failure = await AsyncResult.mapAsync((value) => Promise.resolve(value * 2), div(10, 0))
expect(failure).toEqual({ tag: 'failure', failure: 'div by zero' })
```

### AsyncResult.mapAsyncError

Returns a new `AsyncResult`, mapping any failure value using the given transformation and unwrapping the produced `Promise`.

```typescript
// Simplified signatures
type mapAsyncError = {
  <NewFailure, Success, Failure>(
    transform: (failure: Failure) => Promise<NewFailure>,
    result: SomeResult<Success, Failure>
  ): AsyncResult<Success, NewFailure>

  <NewFailure, Success, Failure>(transform: (failure: Failure) => Promise<NewFailure>): (
    result: SomeResult<Success, Failure>
  ) => AsyncResult<Success, NewFailure>
}

// Example
const div = (a: number, b: number) /*: AsyncResult<number, 'div by zero'> */ =>
  Promise.resolve(b === 0 ? Result.failure('div by zero' as const) : Result.success(a / b))

const success = await AsyncResult.mapAsyncError(
  (error) => Promise.resolve(`Error: ${error}`),
  div(10, 5)
)
expect(success).toEqual({ tag: 'success', success: 2 })

const failure = await AsyncResult.mapAsyncError(
  (error) => Promise.resolve(`Error: ${error}`),
  div(10, 0)
)
expect(failure).toEqual({ tag: 'failure', failure: 'Error: div by zero' })
```

### AsyncResult.match

Unwraps `SomeResult` and transforms success and failure values or returns a default value if needed transform is not provided.
Both `success` and `failure` case transforms are required unless `default` value provided or corresponding case has `never` type.

```typescript
// Simplified signatures
type match = {
  <Success, Failure, Match>(
    transform: {
      success: (value: Success) => Match
      failure: (error: Failure) => Match
    },
    result: SomeResult<Success, Failure>
  ): Promise<Match>

  <Success, Failure, Match>(transform: {
    success: (value: Success) => Match
    failure: (error: Failure) => Match
  }): (result: SomeResult<Success, Failure>) => Promise<Match>

  <Success, Failure, Match>(
    transform: {
      success?: (value: Success) => NonNullable<Match>
      failure?: (error: Failure) => NonNullable<Match>
      default: Match
    },
    result: SomeResult<Success, Failure>
  ): Promise<Match>

  <Success, Failure, Match>(transform: {
    success?: (value: Success) => NonNullable<Match>
    failure?: (error: Failure) => NonNullable<Match>
    default: Match
  }): (result: SomeResult<Success, Failure>) => Promise<Match>

  <Failure, Match>(
    transform: {
      failure: (error: Failure) => Match
    },
    result: SomeResult<never, Failure>
  ): Promise<Match>

  <Failure, Match>(transform: { failure: (error: Failure) => Match }): (
    result: SomeResult<never, Failure>
  ) => Promise<Match>

  <Success, Match>(
    transform: {
      success: (value: Success) => Match
    },
    result: SomeResult<Success, never>
  ): Promise<Match>

  <Success, Match>(transform: { success: (value: Success) => Match }): (
    result: SomeResult<Success, never>
  ) => Promise<Match>
}

// Example
const div = (a: number, b: number) /*: AsyncResult<number, 'div by zero'> */ =>
  Promise.resolve(b === 0 ? Result.failure('div by zero' as const) : Result.success(a / b))

const matcher = {
  success: (value: number) => `success is ${value}`,
  failure: (error: string) => `failure is ${error}`
}

const success = await AsyncResult.match(matcher, div(10, 1))
expect(success).toEqual('success is 10')

const failure = await AsyncResult.match(matcher, div(10, 0))
expect(failure).toEqual('failure is div by zero')
```

### AsyncResult.combine

Combines multiple `SomeResult`s into single one. This function has two signatures: the first one combines
a list of results into single result `[SomeResult<S1, F1>, SomeResult<S2, F2>, ...] => AsyncResult<[S1, S2, ...], F1 | F2 | ...>`
and the second one combines a list of functions where each function takes 0-1 arguments and returns a result into
a function that takes a list of arguments and returns a result
`[() => SomeResult<S1, F1>, (arg: Arg2) => SomeResult<S2, F2>, ...] => (args: [undefined, Arg2, ...]) => AsyncResult<[S1, S2, ...], F1 | F2 | ...>`,
if all functions have 0 arguments then combined function also will have 0 arguments
`[() => SomeResult<S1, F1>, () => SomeResult<S2, F2>] => () => AsyncResult<[S1, S2], F1 | F2>`.

```typescript
// Simplified signatures
type combine = {
  <Results, Successes, Failure>(...results: Results): AsyncResult<Successes, Failure>

  <Results, Args, Successes, Failure>(...results: Results): Args extends Array<undefined>
    ? () => AsyncResult<Successes, Failure>
    : (args: Args) => AsyncResult<Successes, Failure>
}

// Example
const success = await AsyncResult.combine(
  Promise.resolve(Result.success(1)),
  Result.success('success')
)
expect(success).toEqual(Result.success([1, 'success']))

const failure = await AsyncResult.combine(
  Result.success(1),
  Promise.resolve(Result.failure('failure'))
)
expect(failure).toEqual(Result.failure('failure'))

const foo = AsyncResult.combine(
  (num: number) => Result.success(num),
  (str: string) => Result.success(str)
)

expect(await foo([123, 'test'])).toEqual(Result.success([123, 'test']))

const bar = AsyncResult.combine(
  () => Result.success(321),
  () => Result.success('abc')
)

expect(await bar()).toEqual(Result.success([321, 'abc']))
```

---
