import { createFailure, createSuccess } from './result'

export const createResult = () => {
  function flatMap(transform, result) {
    return result === undefined
      ? (r) => flatMap(transform, r)
      : Promise.resolve(result).then((r) => (r.tag === 'success' ? transform(r.success) : r))
  }
  function map(transform, result) {
    return result === undefined
      ? flatMap((value) => createSuccess(transform(value)))
      : flatMap((value) => createSuccess(transform(value)), result)
  }
  function mapAsync(transform, result) {
    return result === undefined
      ? flatMap((value) => transform(value).then(createSuccess))
      : flatMap((value) => transform(value).then(createSuccess), result)
  }
  function flatMapError(transform, result) {
    return result === undefined
      ? (r) => flatMapError(transform, r)
      : Promise.resolve(result).then((r) => (r.tag === 'failure' ? transform(r.failure) : r))
  }
  function mapError(transform, result) {
    return result === undefined
      ? flatMapError((value) => createFailure(transform(value)))
      : flatMapError((value) => createFailure(transform(value)), result)
  }
  function mapErrorAsync(transform, result) {
    return result === undefined
      ? flatMapError((value) => transform(value).then(createFailure))
      : flatMapError((value) => transform(value).then(createFailure), result)
  }
  function unwrap(transform) {
    return (result) =>
      result.then((r) =>
        r.tag === 'success'
          ? transform?.success?.(r.success) ?? r.success
          : transform?.failure?.(r.failure) ?? r.failure
      )
  }
  function combine(...results) {
    function isTupleFunResults(value) {
      return value.length > 1 && typeof value[0] === 'function'
    }
    function isTupleResults(value) {
      return value.length > 1
    }
    function isMapFunResults(value) {
      const [maybeMap] = value
      const firstKey = Object.keys(maybeMap)[0]
      return firstKey !== undefined && typeof maybeMap[firstKey] === 'function'
    }
    if (isTupleFunResults(results)) {
      return combineFunTuple(results)
    }
    if (isTupleResults(results)) {
      return combineIter(results, [])
    }
    if (isMapFunResults(results)) {
      return combineFunMap(results)
    }
    const [resultMap] = results
    const keys = Object.keys(resultMap)
    return map(
      (rs) => keys.reduce((acc, val, idx) => ({ ...acc, [val]: rs[idx] }), {}),
      combineIter(
        keys.map((key) => resultMap[key]),
        []
      )
    )
  }
  function combineFunTuple(funResults) {
    return (args) => {
      return combine(...funResults.map((fun, i) => fun((args ?? [])[i])))
    }
  }
  function combineFunMap(funResults) {
    return (arg) => {
      const [funResult] = funResults
      const keys = Object.keys(funResult)
      return combine(keys.reduce((acc, k) => ({ ...acc, [k]: funResult[k]((arg ?? {})[k]) }), {}))
    }
  }
  const combineIter = (results, successes) =>
    results.length === 1
      ? map((success) => [...successes, success], results[0])
      : flatMap((success) => combineIter(results.slice(1), [...successes, success]), results[0])

  return {
    map,
    mapAsync,
    flatMap,
    mapError,
    mapErrorAsync,
    flatMapError,
    unwrap,
    combine
  }
}
