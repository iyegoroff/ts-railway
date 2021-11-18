# ts-railway

[![npm](https://img.shields.io/npm/v/ts-railway)](https://npm.im/ts-railway)
[![CircleCI](https://circleci.com/gh/iyegoroff/ts-railway.svg?style=svg)](https://circleci.com/gh/iyegoroff/ts-railway)
[![codecov](https://codecov.io/gh/iyegoroff/ts-railway/branch/main/graph/badge.svg?t=1520230083925)](https://codecov.io/gh/iyegoroff/ts-railway)
[![Type Coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fiyegoroff%2Fts-railway%2Fmain%2Fpackage.json)](https://github.com/plantain-00/type-coverage)
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/ts-railway)
[![Bundlephobia](https://badgen.net/bundlephobia/minzip/ts-railway?label=min+gzip)](https://bundlephobia.com/package/ts-railway@3)
[![npm](https://img.shields.io/npm/l/ts-railway.svg?t=1495378566925)](https://www.npmjs.com/package/ts-railway)

<!-- [![Dependency Status](https://david-dm.org/iyegoroff/ts-railway.svg?t=1495378566925)](https://david-dm.org/iyegoroff/ts-railway)
[![devDependencies Status](https://david-dm.org/iyegoroff/ts-railway/dev-status.svg)](https://david-dm.org/iyegoroff/ts-railway?type=dev) -->

ROP flavoured Result & AsyncResult types. Based on [Railway oriented programming](https://fsharpforfunandprofit.com/posts/recipe-part2/) article by Scott Wlaschin.

## Getting started

`$ npm i ts-railway`

## Overview

### Main types

- [`SuccessResult<Success>`](./src/types.ts#L1) - represents a success with an associated value of `Success` type
- [`FailureResult<Failure>`](./src/types.ts#L6) - represents a failure with an associated value of `Failure` type
- [`Result<Success, Failure>`](./src/types.ts#L12) - a union of `SuccessResult` and `FailureResult`
- [`AsyncResult<Success, Failure>`](./src/types.ts#L20) - a `Result` wrapped in `Promise`
- [`SomeResult<Success, Failure>`](./src/types.ts#L22) - a union of `Result` and `AsyncResult`

---

### Functions

All mapping functions have at least two overloaded signatures - common `(transform, result) => new_result` and curried `(transform) => (result) => new_result`. Curried form is intended to be used with some piping function (e.g. [pipe-ts](https://npm.im/pipe-ts)).

|               | Result                       | AsyncResult                        |
| ------------- | ---------------------------- | ---------------------------------- |
| success       | [➡️](###Result.success)      | 🚫                                 |
| failure       | [➡️](###Result.failure)      | 🚫                                 |
| map           | [➡️](###Result.map)          | [➡️](###AsyncResult.map)           |
| mapError      | [➡️](###Result.mapError)     | [➡️](###AsyncResult.mapError)      |
| flatMap       | [➡️](###Result.flatMap)      | [➡️](###AsyncResult.flatMap)       |
| flatMapError  | [➡️](###Result.flatMapError) | [➡️](###AsyncResult.flatMapError)  |
| mapAsync      | 🚫                           | [➡️](###AsyncResult.mapAsync)      |
| mapAsyncError | 🚫                           | [➡️](###AsyncResult.mapAsyncError) |
| match         | [➡️](###Result.match)        | [➡️](###AsyncResult.match)         |
| combine       | [➡️](###Result.combine)      | [➡️](###AsyncResult.combine)       |

---

### Result

These functions are synchronous. Mapping functions take `Result` and return transformed `Result`.

#### Result.success

Creates `SuccessResult`.

```typescript
// Signature
type success = <Success>(success: Success) => SuccessResult<Success>

// Example
const result = Result.success(1)
expect(result).toEqual({ tag: 'success', success: 1 })
```

#### Result.failure

Creates `FailureResult`.

```typescript
// Signature
type failure = <Failure>(failure: Failure) => FailureResult<Failure>

// Example
const result = Result.failure('test')
expect(result).toEqual({ tag: 'failure', failure: 'test' })
```

#### Result.map

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

#### Result.mapError

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

#### Result.flatMap

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

#### Result.flatMapError

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

#### Result.match

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

#### Result.combine

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

---

### AsyncResult

These functions are asynchronous. Mapping functions take `SomeResult` and return transformed `AsyncResult`.

#### AsyncResult.map

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

#### AsyncResult.mapError

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

#### AsyncResult.flatMap

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

#### AsyncResult.flatMapError

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

#### AsyncResult.mapAsync

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

#### AsyncResult.mapAsyncError

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

#### AsyncResult.match

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

#### AsyncResult.combine

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

## Misc

### Avoiding 'pyramid of doom'

Composing several functions with multiple arguments can be cumbersome and will lead to 'pyramid of doom' style of code:

```typescript
const result = Result.map(
  (x: string) => [...x].reverse().join(''),
  Result.map(
    (x: number) => `${x}`,
    Result.map(
      (x: number) => x + 234,
      Result.mapError(
        (x: 'div by zero') => ({ divError: x } as const),
        Result.map((x) => x * 2, div(500, 1))
      )
    )
  )
)

expect(result).toEqual({
  tag: 'success',
  success: '4321'
})
```

This can be easily avoided when using curried forms of functions with a piping function:

```typescript
import { pipeWith } from 'pipe-ts'

const result = pipeWith(
  div(500, 1),
  Result.mapError((x) => ({ divError: x } as const)),
  Result.map((x) => x * 2),
  Result.map((x) => x + 234),
  Result.map((x) => `${x}`),
  Result.map((x) => [...x].reverse().join(''))
)

expect(result).toEqual<typeof result>({
  tag: 'success',
  success: '4321'
})
```

---

### Programming style

There are certain [catches](https://fsharpforfunandprofit.com/posts/against-railway-oriented-programming/) of railway
oriented programming. Most of them are matter of program design quality. But in the context of TypeScript language,
the most serious problem is the ability to completely discard the result of a function call ([TypeScript/#8240](https://github.com/microsoft/TypeScript/issues/8240), [TypeScript/#8584](https://github.com/microsoft/TypeScript/issues/8584)). For example, in the following
snippet possible parsing error will be discarded:

```typescript
declare const obj: {
  parse: <T>(json: string) => Result<T, Error>
}

function foo() {
  obj.parse('][') // Result is discarded!
}

foo()
```

More sneaky error:

```typescript
declare function updateUser(info: { name: string }): AsyncResult<undefined, Error>

declare const MyButton: {
  onClick: () => void
}

MyButton.onClick(
  () => updateUser({ name: 'username' }) // AsyncResult is covered with void and discarded!
)
```

These kind of problems can be minimized by using proper project configuration: setting `"strict": true` in `tsconfig`,
prohibiting expression statements with `functional/no-expression-statement` rule from [eslint-plugin-functional](https://npm.im/eslint-plugin-functional) and banning `void` type with `@typescript-eslint/ban-types` rule
from [@typescript-eslint/eslint-plugin](https://npm.im/@typescript-eslint/eslint-plugin). [tsconfig.json](./tsconfig.json) and [.eslintrc](./.eslintrc) files from this project could be used as a starting point.
