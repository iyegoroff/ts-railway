# ts-railway

[![npm](https://img.shields.io/npm/v/ts-railway)](https://npm.im/ts-railway)
[![CircleCI](https://circleci.com/gh/iyegoroff/ts-railway.svg?style=svg)](https://circleci.com/gh/iyegoroff/ts-railway)
[![codecov](https://codecov.io/gh/iyegoroff/ts-railway/branch/main/graph/badge.svg?t=1520230083925)](https://codecov.io/gh/iyegoroff/ts-railway)
[![Type Coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fiyegoroff%2Fts-railway%2Fmain%2Fpackage.json)](https://github.com/plantain-00/type-coverage)
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/ts-railway)
[![Bundlephobia](https://badgen.net/bundlephobia/minzip/ts-railway?label=min+gzip)](https://bundlephobia.com/package/ts-railway)
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

|               | Result                                   | AsyncResult                                          |
| ------------- | ---------------------------------------- | ---------------------------------------------------- |
| success       | [↗️](./mds/result.md#resultsuccess)      | 🚫                                                   |
| failure       | [↗️](./mds/result.md#resultfailure)      | 🚫                                                   |
| map           | [↗️](./mds/result.md#resultmap)          | [↗️](./mds/async-result.md#asyncresultmap)           |
| mapError      | [↗️](./mds/result.md#resultmaperror)     | [↗️](./mds/async-result.md#asyncresultmaperror)      |
| flatMap       | [↗️](./mds/result.md#resultflatmap)      | [↗️](./mds/async-result.md#asyncresultflatmap)       |
| flatMapError  | [↗️](./mds/result.md#resultflatmaperror) | [↗️](./mds/async-result.md#asyncresultflatmaperror)  |
| mapAsync      | 🚫                                       | [↗️](./mds/async-result.md#asyncresultmapasync)      |
| mapAsyncError | 🚫                                       | [↗️](./mds/async-result.md#asyncresultmapasyncerror) |
| match         | [↗️](./mds/result.md#resultmatch)        | [↗️](./mds/async-result.md#asyncresultmatch)         |
| combine       | [↗️](./mds/result.md#resultcombine)      | [↗️](./mds/async-result.md#asyncresultcombine)       |

---

## Misc

### Avoiding 'pyramid of doom'

Composing several functions with multiple arguments can be cumbersome and will lead to 'pyramid of doom' style of code:

```typescript
const div = (a: number, b: number) /*: Result<number, 'div by zero'> */ =>
  b === 0 ? Result.failure('div by zero' as const) : Result.success(a / b)

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

---

### Exception handling

`ts-railway` is intended to handle only [domain errors](https://fsharpforfunandprofit.com/posts/against-railway-oriented-programming/#when-should-you-use-result) and doesn't catch thrown exceptions and unhandled promise rejections. The common scenario to deal
with exceptions is to catch them globally, log somehow and then decide whether to prevent an exception by fixing/changing the
program or to convert that exception to domain error:

```typescript
const errorHandler: OnErrorEventHandlerNonNull = (event) => {
  MyLoggingService.log(event)
}

window.onerror = errorHandler
window.onunhandledrejection = errorHandler
```
