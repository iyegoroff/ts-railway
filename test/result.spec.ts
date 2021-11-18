import { Result } from '../src'
import { pipeable } from 'ts-pipe'
import { pipeWith } from 'pipe-ts'

describe('Result', () => {
  test('map success', () => {
    const ok = Result.success(1)

    expect(Result.map<string, number, string>((value) => `ok ${value}`)(ok)).toEqual<
      Result<string, never>
    >({
      tag: 'success',
      success: 'ok 1'
    })

    expect(Result.map((value) => `test ${value}`, ok)).toEqual<Result<string, never>>({
      tag: 'success',
      success: 'test 1'
    })
  })

  test('map failure', () => {
    const err: Result<number, string> = Result.failure('fail')

    expect(Result.map<string, number, string>((value) => `ok ${value}`)(err)).toEqual<
      Result<never, string>
    >({
      tag: 'failure',
      failure: 'fail'
    })
  })

  test('mapError success', () => {
    const ok: Result<number, string> = Result.success(1)

    expect(Result.mapError<string, number, string>((value) => `err ${value}`)(ok)).toEqual<
      Result<number, never>
    >({
      tag: 'success',
      success: 1
    })
  })

  test('mapError failure', () => {
    const err = Result.failure('fail')

    expect(Result.mapError<string, string, string>((value) => `err ${value}`)(err)).toEqual<
      Result<never, string>
    >({
      tag: 'failure',
      failure: 'err fail'
    })

    expect(Result.mapError((value) => `test ${value}`, err)).toEqual<Result<never, string>>({
      tag: 'failure',
      failure: 'test fail'
    })
  })

  test('match', () => {
    const ok = Result.success(1)
    const r1 = pipeable(ok).pipe(Result.match({ success: (x) => `${x}` })).value

    const err = Result.failure(1)
    const r2 = pipeable(err).pipe(Result.match({ failure: (x) => `${x}` })).value

    const def = Math.random() > 0.5 ? Result.success(1) : Result.failure(2)
    const r3 = pipeable(def).pipe(
      Result.match({
        default: 123
      })
    ).value

    const defOk = ((): Result<1, 2> => Result.success(1))()
    const r4 = pipeable(defOk).pipe(
      Result.match({
        failure: (x) => x,
        success: (x) => x
      })
    ).value

    const defErr = ((): Result<1, 2> => Result.failure(2))()
    const r5 = pipeable(defErr).pipe(
      Result.match({
        failure: (x) => x,
        success: (x) => x
      })
    ).value

    const defOkNoSuccess = ((): Result<1, 2> => Result.success(1))()
    const r6 = pipeable(defOkNoSuccess).pipe(
      Result.match({
        failure: (x) => x,
        default: 5
      })
    ).value

    const defErrNoFailure = ((): Result<1, 2> => Result.failure(2))()
    const r7 = pipeable(defErrNoFailure).pipe(
      Result.match({
        success: (x) => x,
        default: 5
      })
    ).value

    expect(r1).toEqual('1')
    expect(r2).toEqual('1')
    expect(r3).toEqual(123)
    expect(r4).toEqual(1)
    expect(r5).toEqual(2)
    expect(r6).toEqual(5)
    expect(r7).toEqual(5)
  })

  test('merged', () => {
    const foo = (x: number, y: number) => {
      if (Number.isNaN(x)) {
        return Result.failure({ nan: 'x' } as const)
      }

      if (Number.isNaN(y)) {
        return Result.failure({ nan: 'y' } as const)
      }

      if (x > y) {
        return Result.success({ op: '>' } as const)
      }

      if (x < y) {
        return Result.success({ op: '<' } as const)
      }

      if (x === y) {
        return Result.success({ op: '===' } as const)
      }

      return Result.failure({ nan: 'fail' } as const)
    }

    expect(
      pipeWith(
        foo(1, 2),
        Result.match({
          success: (x) => `op is ${x.op}`,
          failure: (x) => `${x.nan} is nan`
        })
      )
    ).toEqual('op is <')

    expect(pipeable(foo(1, 2)).pipe(Result.map((x) => `op is ${x.op}`)).value).toEqual(
      Result.success('op is <')
    )

    expect(
      pipeWith(
        foo(3, 2),
        Result.map((x) => `op is ${x.op}`)
      )
    ).toEqual(Result.success('op is >'))

    expect(Result.map((x) => `op is ${x.op}`, foo(2, 2))).toEqual(Result.success('op is ==='))

    expect(Result.flatMap((x) => Result.success(`op is ${x.op}`), foo(2, 2))).toEqual(
      Result.success('op is ===')
    )

    expect(
      pipeWith(
        foo(2, 2),
        Result.flatMap((x) => Result.success(`op is ${x.op}`))
      )
    ).toEqual(Result.success('op is ==='))

    expect(Result.mapError((x) => `${x.nan} is nan`, foo(NaN, 2))).toEqual(
      Result.failure('x is nan')
    )

    expect(
      pipeWith(
        foo(2, NaN),
        Result.mapError((x) => `${x.nan} is nan`)
      )
    ).toEqual(Result.failure('y is nan'))

    expect(Result.flatMapError((x) => Result.failure(`${x.nan} is nan`), foo(2, NaN))).toEqual(
      Result.failure('y is nan')
    )

    expect(Result.flatMapError((x) => Result.failure(`${x.nan} is nan`), foo(2, 2))).toEqual(
      Result.success({ op: '===' })
    )

    expect(
      pipeWith(
        foo(2, NaN),
        Result.flatMapError((x) => Result.failure(`${x.nan} is nan`))
      )
    ).toEqual(Result.failure('y is nan'))
  })

  test('combine - results', () => {
    const combinedFail = Result.combine(
      Result.success(1),
      Result.failure('fail'),
      Result.success({ value: '!!!' }),
      Result.failure({ error: new Error('error') })
    )

    expect(combinedFail).toEqual(Result.failure('fail'))

    const combinedSuccess = Result.combine(
      Result.success(1),
      Result.success({ value: '!!!' }),
      Result.success('test')
    )

    expect(combinedSuccess).toEqual(Result.success([1, { value: '!!!' }, 'test']))
  })

  test('combine - functions', () => {
    const combinedFail = Result.combine(
      (x: 1) => Result.success(x),
      (_: 2) => Result.failure('fail'),
      (_: 3) => Result.success({ value: '!!!' }),
      () => Result.failure({ error: new Error('error') })
    )

    expect(combinedFail([1, 2, 3, undefined])).toEqual<ReturnType<typeof combinedFail>>(
      Result.failure('fail')
    )

    const combinedSuccess = Result.combine(
      (x: 1) => Result.success(x + 1),
      (y: { readonly value: '!!!' }) => Result.success(y),
      (z: 'test') => Result.success(z)
    )

    expect(combinedSuccess([1, { value: '!!!' }, 'test'])).toEqual<
      ReturnType<typeof combinedSuccess>
    >(Result.success([2, { value: '!!!' }, 'test']))
  })

  test('combine - functions with no args', () => {
    const combinedSuccess = Result.combine(
      () => Result.success(1),
      () => Result.success({ value: '!!!' }),
      () => Result.success('test')
    )

    expect(combinedSuccess()).toEqual(Result.success([1, { value: '!!!' }, 'test']))
  })
})
