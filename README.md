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

ROP flavoured Result & AsyncResult types

## Getting started

`$ npm install ts-railway --save`

## Overview

### Result

```typescript
export declare type Result<Success, Failure> =
  | {
      readonly tag: 'success'
      readonly success: Success
    }
  | {
      readonly tag: 'failure'
      readonly failure: Failure
    }

//...

export declare const Result: {
  readonly success: typeof createSuccess
  readonly failure: typeof createFailure
  readonly map: typeof map
  readonly flatMap: typeof flatMap
  readonly mapError: typeof mapError
  readonly flatMapError: typeof flatMapError
  readonly unwrap: typeof unwrap
  readonly combine: typeof combine
}
```

### AsyncResult

```typescript
export type AsyncResult<Success, Failure> = Promise<Result<Success, Failure>>

//...

export declare const AsyncResult: {
  readonly map: typeof map
  readonly mapAsync: typeof mapAsync
  readonly flatMap: typeof flatMap
  readonly mapError: typeof mapError
  readonly mapErrorAsync: typeof mapErrorAsync
  readonly flatMapError: typeof flatMapError
  readonly unwrap: typeof unwrap
  readonly combine: typeof combine
}
```

## Credits

- [Railway oriented programming](https://fsharpforfunandprofit.com/posts/recipe-part2/) article by Scott Wlaschin
