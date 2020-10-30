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

  test('unwrap', () => {
    const ok: Result<number, string> = Result.success(1)
    const r1: string | number = pipeable(ok).pipe(Result.unwrap()).value
    const r2: string = pipeable(ok).pipe(Result.unwrap({ success: (x) => `${x}` })).value

    const err: Result<string, number> = Result.failure(1)
    const r3: string | number = pipeable(err).pipe(Result.unwrap()).value
    const r4: string = pipeable(err).pipe(Result.unwrap({ failure: (x) => `${x}` })).value

    expect(r1).toEqual(1)
    expect(r2).toEqual('1')
    expect(r3).toEqual(1)
    expect(r4).toEqual('1')
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
        Result.unwrap({
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

    expect(
      pipeWith(
        foo(2, NaN),
        Result.flatMapError((x) => Result.failure(`${x.nan} is nan`))
      )
    ).toEqual(Result.failure('y is nan'))
  })

  test('combine array', () => {
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

  test('combine function array', () => {
    const combinedFail = Result.combine(
      (x: 1) => Result.success(x),
      (x: 'fail') => Result.failure(x),
      (x: { readonly value: '!!!' }) => Result.success(x),
      (x: { readonly error: Error }) => Result.failure(x)
    )

    expect(combinedFail([1, 'fail', { value: '!!!' }, { error: new Error('error') }])).toEqual(
      Result.failure('fail')
    )

    const combinedSuccess = Result.combine(
      (x: 1) => Result.success(x),
      (x: { readonly value: '!!!' }) => Result.success(x),
      (x: 'test') => Result.success(x)
    )

    expect(combinedSuccess([1, { value: '!!!' }, 'test'])).toEqual(
      Result.success([1, { value: '!!!' }, 'test'])
    )
  })

  test('combine object', () => {
    const combinedFail = Result.combine({
      first: Result.success(1),
      second: Result.failure('fail'),
      third: Result.success({ value: '!!!' }),
      fourth: Result.failure({ error: new Error('error') })
    })

    expect(combinedFail).toEqual(Result.failure('fail'))

    const combinedSuccess = Result.combine({
      first: Result.success(1),
      second: Result.success({ value: '!!!' }),
      third: Result.success('test')
    })

    expect(combinedSuccess).toEqual(
      Result.success({ first: 1, second: { value: '!!!' }, third: 'test' })
    )
  })

  test('combine function object', () => {
    const combinedFail = Result.combine({
      first: (x: 1) => Result.success(x),
      second: (x: 'fail') => Result.failure(x),
      third: (x: { readonly value: '!!!' }) => Result.success(x),
      fourth: (x: { readonly error: Error }) => Result.failure(x)
    })

    expect(
      combinedFail({
        first: 1,
        second: 'fail',
        third: { value: '!!!' },
        fourth: { error: new Error('error') }
      })
    ).toEqual(Result.failure('fail'))

    const combinedSuccess = Result.combine({
      first: (x: 1) => Result.success(x),
      second: (x: { readonly value: '!!!' }) => Result.success(x),
      third: (x: 'test') => Result.success(x)
    })

    expect(
      combinedSuccess({
        first: 1,
        second: { value: '!!!' },
        third: 'test'
      })
    ).toEqual(Result.success({ first: 1, second: { value: '!!!' }, third: 'test' }))
  })
})
