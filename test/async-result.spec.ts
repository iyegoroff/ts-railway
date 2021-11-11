import { Result, AsyncResult } from '../src'
import { pipeable } from 'ts-pipe'
import { pipeWith } from 'pipe-ts'

// type-coverage:ignore-next-line
const mockNever: never = undefined as never

describe('AsyncResult', () => {
  test('ofResult', async () => {
    expect(await Promise.resolve(Result.success(1))).toEqual<Result<number, never>>({
      tag: 'success',
      success: 1
    })
  })

  test('map success', async () => {
    const ok = Promise.resolve(Result.success(1))

    expect(await AsyncResult.map<string, number, string>((value) => `ok ${value}`)(ok)).toEqual<
      Result<string, never>
    >({
      tag: 'success',
      success: 'ok 1'
    })

    expect(await AsyncResult.map((value) => `test ${value}`, ok)).toEqual<Result<string, never>>({
      tag: 'success',
      success: 'test 1'
    })
  })

  test('map failure', async () => {
    const err: AsyncResult<number, string> = Promise.resolve(Result.failure('fail'))

    expect(await AsyncResult.map<string, number, string>((value) => `ok ${value}`)(err)).toEqual<
      Result<never, string>
    >({
      tag: 'failure',
      failure: 'fail'
    })
  })

  test('mapAsync success', async () => {
    const ok = Promise.resolve(Result.success(1))

    expect(
      await AsyncResult.mapAsync<string, number, string>((value) => Promise.resolve(`ok ${value}`))(
        ok
      )
    ).toEqual<Result<string, never>>({
      tag: 'success',
      success: 'ok 1'
    })

    expect(await AsyncResult.mapAsync((value) => Promise.resolve(`test ${value}`), ok)).toEqual<
      Result<string, never>
    >({
      tag: 'success',
      success: 'test 1'
    })
  })

  test('mapAsync failure', async () => {
    const err: AsyncResult<number, string> = Promise.resolve(Result.failure('fail'))

    expect(
      await AsyncResult.mapAsync<string, number, string>((value) => Promise.resolve(`ok ${value}`))(
        err
      )
    ).toEqual<Result<never, string>>({
      tag: 'failure',
      failure: 'fail'
    })
  })

  test('mapError success', async () => {
    const ok: AsyncResult<number, string> = Promise.resolve(Result.success(1))

    expect(
      await AsyncResult.mapError<string, number, string>((value) => `err ${value}`)(ok)
    ).toEqual<Result<number, never>>({
      tag: 'success',
      success: 1
    })
  })

  test('mapError failure', async () => {
    const err = Promise.resolve(Result.failure('fail'))

    expect(
      await AsyncResult.mapError<string, string, string>((value) => `err ${value}`)(err)
    ).toEqual<Result<never, string>>({
      tag: 'failure',
      failure: 'err fail'
    })

    expect(await AsyncResult.mapError((value) => `test ${value}`, err)).toEqual<
      Result<never, string>
    >({
      tag: 'failure',
      failure: 'test fail'
    })
  })

  test('mapErrorAsync success', async () => {
    const ok: AsyncResult<number, string> = Promise.resolve(Result.success(1))

    expect(
      await AsyncResult.mapErrorAsync<string, number, string>((value) =>
        Promise.resolve(`err ${value}`)
      )(ok)
    ).toEqual<Result<number, never>>({
      tag: 'success',
      success: 1
    })
  })

  test('mapErrorAsync failure', async () => {
    const err = Promise.resolve(Result.failure('fail'))

    expect(
      await AsyncResult.mapErrorAsync<string, string, string>((value) =>
        Promise.resolve(`err ${value}`)
      )(err)
    ).toEqual<Result<never, string>>({
      tag: 'failure',
      failure: 'err fail'
    })

    expect(
      await AsyncResult.mapErrorAsync((value) => Promise.resolve(`test ${value}`), err)
    ).toEqual<Result<never, string>>({
      tag: 'failure',
      failure: 'test fail'
    })
  })

  test('match', async () => {
    const ok = Promise.resolve(Result.success(1))
    const r1: Promise<string> = pipeable(ok).pipe(
      AsyncResult.match({ success: (x) => `${x}` })
    ).value

    const err = Promise.resolve(Result.failure(1))
    const r2: Promise<string> = pipeable(err).pipe(
      AsyncResult.match({ failure: (x) => `${x}` })
    ).value

    const wut = Promise.resolve(Result.success(mockNever))
    const r3 = pipeable(wut).pipe(AsyncResult.match({})).value

    const wut2 = Promise.resolve(Result.failure(mockNever))
    const r4 = pipeable(wut2).pipe(AsyncResult.match({})).value

    expect(await r1).toEqual('1')
    expect(await r2).toEqual('1')
    expect(await r3).toEqual(undefined)
    expect(await r4).toEqual(undefined)
  })

  test('merged', async () => {
    const foo = async (x: number, y: number) => {
      if (Number.isNaN(x)) {
        return await Promise.resolve(Result.failure({ nan: 'x' } as const))
      }

      if (Number.isNaN(y)) {
        return await Promise.resolve(Result.failure({ nan: 'y' } as const))
      }

      if (x > y) {
        return await Promise.resolve(Result.success({ op: '>' } as const))
      }

      if (x < y) {
        return await Promise.resolve(Result.success({ op: '<' } as const))
      }

      if (x === y) {
        return await Promise.resolve(Result.success({ op: '===' } as const))
      }

      return await Promise.resolve(Result.failure({ nan: 'fail' } as const))
    }

    expect(
      await pipeWith(
        foo(1, 2),
        AsyncResult.match({
          success: (x) => `op is ${x.op}`,
          failure: (x) => `${x.nan} is nan`
        })
      )
    ).toEqual('op is <')

    expect(await pipeable(foo(1, 2)).pipe(AsyncResult.map((x) => `op is ${x.op}`)).value).toEqual(
      Result.success('op is <')
    )

    expect(
      await pipeWith(
        foo(3, 2),
        AsyncResult.map((x) => `op is ${x.op}`)
      )
    ).toEqual(Result.success('op is >'))

    expect(await AsyncResult.map((x) => `op is ${x.op}`, foo(2, 2))).toEqual(
      Result.success('op is ===')
    )

    expect(await AsyncResult.mapAsync((x) => Promise.resolve(`op is ${x.op}`), foo(2, 2))).toEqual(
      Result.success('op is ===')
    )

    expect(
      await pipeWith(
        foo(2, 2),
        AsyncResult.mapAsync((x) => Promise.resolve(`op is ${x.op}`))
      )
    ).toEqual(Result.success('op is ==='))

    expect(await AsyncResult.flatMap((x) => Result.success(`op is ${x.op}`), foo(2, 2))).toEqual(
      Result.success('op is ===')
    )

    expect(
      await pipeWith(
        foo(2, 2),
        AsyncResult.flatMap((x) => Result.success(`op is ${x.op}`))
      )
    ).toEqual(Result.success('op is ==='))

    expect(await AsyncResult.mapError((x) => `${x.nan} is nan`, foo(NaN, 2))).toEqual(
      Result.failure('x is nan')
    )

    expect(
      await pipeWith(
        foo(2, NaN),
        AsyncResult.mapError((x) => `${x.nan} is nan`)
      )
    ).toEqual(Result.failure('y is nan'))

    expect(
      await AsyncResult.mapErrorAsync((x) => Promise.resolve(`${x.nan} is nan`), foo(2, NaN))
    ).toEqual(Result.failure('y is nan'))

    expect(
      await pipeWith(
        foo(2, NaN),
        AsyncResult.mapErrorAsync((x) => Promise.resolve(`${x.nan} is nan`))
      )
    ).toEqual(Result.failure('y is nan'))
  })

  test('combine - default combiner', async () => {
    const combinedFail = AsyncResult.combine(
      Promise.resolve(Result.success(1)),
      Promise.resolve(Result.failure('fail')),
      Result.success({ value: '!!!' }),
      Result.failure({ error: new Error('error') })
    )

    expect(await combinedFail).toEqual(Result.failure('fail'))

    const combinedSuccess = AsyncResult.combine(
      Result.success(1),
      Promise.resolve(Result.success({ value: '!!!' })),
      Result.success('test')
    )

    expect(await combinedSuccess).toEqual(Result.success([1, { value: '!!!' }, 'test']))
  })

  test('combine - custom combiner', async () => {
    const combinedFail = AsyncResult.combine(
      (a, b, c, d) => ({ a, b, c, d }),
      Promise.resolve(Result.success(1)),
      Promise.resolve(Result.failure('fail')),
      Result.success({ value: '!!!' }),
      Result.failure({ error: new Error('error') })
    )

    expect(await combinedFail).toEqual(Result.failure('fail'))

    const combinedSuccess = AsyncResult.combine(
      (a, b, c) => ({ a, b, c }),
      Result.success(1),
      Promise.resolve(Result.success({ value: '!!!' })),
      Result.success('test')
    )

    expect(await combinedSuccess).toEqual(Result.success({ a: 1, b: { value: '!!!' }, c: 'test' }))
  })
})
