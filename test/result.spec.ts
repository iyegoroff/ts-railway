import { Result } from '../src'
import { pipeable } from 'ts-pipe'
import { pipeWith } from 'pipe-ts'

// type-coverage:ignore-next-line
const mockNever: never = undefined as never

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
    const r1: string = pipeable(ok).pipe(Result.match({ success: (x) => `${x}` })).value

    const err = Result.failure(1)
    const r2: string = pipeable(err).pipe(Result.match({ failure: (x) => `${x}` })).value

    const wut = Result.success(mockNever)
    const r3 = pipeable(wut).pipe(Result.match({})).value

    const wut2 = Result.failure(mockNever)
    const r4 = pipeable(wut2).pipe(Result.match({})).value

    expect(r1).toEqual('1')
    expect(r2).toEqual('1')
    expect(r3).toEqual(undefined)
    expect(r4).toEqual(undefined)
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
  })

  test('combine - default combiner', () => {
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

  test('combine - custom combiner', () => {
    const combinedFail = Result.combine(
      (a, b, c, d) => ({ a, b, c, d }),
      Result.success(1),
      Result.failure('fail'),
      Result.success({ value: '!!!' }),
      Result.failure({ error: new Error('error') })
    )

    expect(combinedFail).toEqual(Result.failure('fail'))

    const combinedSuccess = Result.combine(
      (a, b, c) => ({ a, b, c }),
      Result.success(1),
      Result.success({ value: '!!!' }),
      Result.success('test')
    )

    expect(combinedSuccess).toEqual(Result.success({ a: 1, b: { value: '!!!' }, c: 'test' }))
  })
})
