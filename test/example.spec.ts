import { pipeWith } from 'pipe-ts'
import { Record, String, Number } from 'runtypes'
import { Result } from '../src'

const div = (a: number, b: number) =>
  b === 0 ? Result.failure('div by zero' as const) : Result.success(a / b)

describe('Result.map, Result.mapError', () => {
  test('Result.map - success', () => {
    const result = Result.map((x) => x * 2, div(10, 5))

    expect(result).toEqual<typeof result>({ tag: 'success', success: 4 })
  })

  test('Result.map - failure', () => {
    const result = Result.map((x) => x * 2, div(10, 0))

    expect(result).toEqual<typeof result>({
      tag: 'failure',
      failure: 'div by zero'
    })
  })

  test('Result.mapError - success', () => {
    const result = Result.mapError((x) => `Error ${x}` as const, div(10, 5))

    expect(result).toEqual<typeof result>({ tag: 'success', success: 2 })
  })

  test('Result.mapError - failure', () => {
    const result = Result.mapError((x) => `Error: ${x}` as const, div(10, 0))

    expect(result).toEqual<typeof result>({
      tag: 'failure',
      failure: 'Error: div by zero'
    })
  })

  test("Result.map - 'pyramid of doom'", () => {
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

    expect(result).toEqual<typeof result>({
      tag: 'success',
      success: '4321'
    })
  })

  test('Result.map - avoiding "pyramid of doom"', () => {
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
  })
})

describe('Result.flatMap, Result.flatMapError', () => {
  const parse = (json: string) => {
    try {
      return Result.success<unknown>(JSON.parse(json))
    } catch (error) {
      return Result.failure({ parsingError: error })
    }
  }

  const validateUser = (maybeUser: unknown) =>
    Record({ id: Number, name: String }).asReadonly().guard(maybeUser)
      ? Result.success(maybeUser)
      : Result.failure({ validationError: 'Invalid user format', data: maybeUser } as const)

  const getUser = (response: { readonly body: string }) =>
    pipeWith(
      response,
      Result.success,
      Result.map(({ body }) => body),
      Result.flatMap(parse),
      Result.flatMap(validateUser)
    )

  const getLanguage = (): Result<'en' | 'ru', 'language not selected'> =>
    Result.failure('language not selected')

  test('Result.flatMap - success', () => {
    const user = { name: 'User', id: 1 }
    const response = { body: JSON.stringify(user) }
    const result = getUser(response)

    expect(result).toEqual<typeof result>({
      tag: 'success',
      success: user
    })
  })

  test('Result.flatMap - failure', () => {
    const user = { age: 99, id: 1 }
    const response = { body: JSON.stringify(user) }
    const result = getUser(response)

    expect(result).toEqual<typeof result>({
      tag: 'failure',
      failure: { validationError: 'Invalid user format', data: user }
    })
  })

  test('Result.flatMapError - failure', () => {
    const result = pipeWith(
      validateUser('no a valid user'),
      Result.flatMapError(({ validationError }) =>
        Result.flatMap(
          (lang) => Result.failure(lang === 'en' ? validationError : ('Неверный формат' as const)),
          getLanguage()
        )
      )
    )

    expect(result).toEqual<typeof result>({
      tag: 'failure',
      failure: 'language not selected'
    })
  })
})

describe('Result.match', () => {
  const ok = (): Result<'ok', 'err'> => Result.success('ok')

  test('Result.match - success', () => {
    const success = pipeWith(
      Result.success(123),
      Result.match({
        success: (x) => `success is ${x}`
      })
    )

    expect(success).toEqual<typeof success>(`success is 123`)
  })

  test('Result.match - failure', () => {
    const success = pipeWith(
      Result.failure(321),
      Result.match({
        failure: (x) => `failure is ${x}`
      })
    )

    expect(success).toEqual<typeof success>(`failure is 321`)
  })

  test('Result.match - default', () => {
    const success = pipeWith(
      ok(),
      Result.match({
        failure: (x) => `failure is ${x}`,
        default: 'not failure'
      })
    )

    expect(success).toEqual<typeof success>('not failure')
  })

  test('Result.match', () => {
    const success = pipeWith(
      ok(),
      Result.match({
        success: (x) => `success is ${x}`,
        failure: (x) => `failure is ${x}`
      })
    )

    expect(success).toEqual<typeof success>('success is ok')
  })
})

describe('Result.combine', () => {
  const foo = (x: number) => Result.success(x + 1)
  const bar = (x: string) => Result.success('bar: ' + x)

  test('Result.combine - results success', () => {
    const success = Result.combine(Result.success(1), Result.success('abc'))

    expect(success).toEqual<typeof success>(Result.success([1, 'abc']))
  })

  test('Result.combine - results failure', () => {
    const failure = Result.combine(Result.success(1), Result.failure('abc'))

    expect(failure).toEqual<typeof failure>(Result.failure('abc'))
  })

  test('Result.combine - functions success', () => {
    const success = Result.combine(foo, bar)

    expect(success([5, 'test'])).toEqual<ReturnType<typeof success>>(
      Result.success([6, 'bar: test'])
    )
  })

  test('Result.combine - functions no arg', () => {
    const success = Result.combine(
      () => Result.success(1),
      () => Result.success(2)
    )

    expect(success()).toEqual<ReturnType<typeof success>>(Result.success([1, 2]))
  })
})

// const t = Date.now()

// const combinedSuccBench = AsyncResult.combine(
//   new Promise<Result<number>>((resolve) => {
//     return setTimeout(() => resolve(Result.success(1)), 500)
//   }),
//   new Promise<Result<number>>((resolve) => {
//     return setTimeout(() => resolve(Result.success(1)), 1500)
//   }),
//   new Promise<Result<number>>((resolve) => {
//     return setTimeout(() => resolve(Result.success(1)), 500)
//   }),
//   new Promise<Result<number>>((resolve) => {
//     return setTimeout(() => resolve(Result.success(1)), 1500)
//   })
// )

// const succ = await combinedSuccBench

// const n = Date.now()

// console.log(n - t, succ)

// const combinedFailBench = AsyncResult.combine(
//   new Promise<Result<number>>((resolve) => {
//     return setTimeout(() => resolve(Result.success(1)), 1500)
//   }),
//   new Promise<Result<number>>((resolve) => {
//     return setTimeout(() => resolve(Result.success(1)), 1500)
//   }),
//   new Promise<Result<number, number>>((resolve) => {
//     return setTimeout(() => resolve(Result.failure(1)), 1)
//   }),
//   new Promise<Result<number>>((resolve) => {
//     return setTimeout(() => resolve(Result.success(1)), 500000)
//   })
// )

// const fail = await combinedFailBench

// console.log(Date.now() - n, fail)
