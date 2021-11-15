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
    // eslint-disable-next-line functional/no-try-statement
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

  test('Result.match', () => {
    // const user = { name: 'User', id: 1 }
    // const userResponse = { body: JSON.stringify(user) }
    // const age = { age: 99, id: 1 }
    // const ageResponse = { body: JSON.stringify(user) }
    // const r2 = pipeWith(
    //   combine((x, y, z) => ({ x, y, z }), div(1, 2), getUser(userResponse), div(1, 2)),
    //   (x) => x
    // )
    // const r3 = pipeWith(combine(div(1, 2), getUser(userResponse), div(1, 2)), (x) => x)
    // const result = pipeWith(
    //   getUser(userResponse),
    //   // Result.flatMap((u) => Result.map((a) => [u, a] as const, getUser(ageResponse))),
    //   // (x) => x
    //   combine(div(5, 1)),
    //   (x) => x,
    //   combine(div(1, 1), (rs, d) => [...rs, d] as const),
    //   (x) => x
    // )
  })

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

  describe('Result.match', () => {
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
