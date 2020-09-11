import { Reducer2, Thunk, Fn } from "./types"

/**
 * Throws an error. Throw statements may only be used imperatively; this function
 * allows for errors to be thrown functionally.
 * @param err
 */
export function throws<E extends string | Error = string>(err: E | Thunk<E>): never {
    if (typeof err === "function") {
        err = err()
    }
    if (typeof err === "string") {
        err = new Error(err) as any
    }

    throw err;
}

export function tryCatch<T>(tryBlock: Thunk<T>, catchBlock: Fn<[string | Error], T | never>): T | never {
    try {
        return tryBlock();
    } catch (err) {
        return catchBlock(err);
    }
}

/**
 * Validates a list of inputs.
 *
 * Each input is checked against a regular expression that represents some
 * criteria. If any input in the list is invalid, the whole input is considered
 * invalid.
 *
 * @param inputs The input list
 * @param regex  The criteria each input must pass
 *
 * @returns `true` if all inputs are valid, `false` otherwise.
 */
export const checkAll: (inputs: string[], regex: RegExp) => boolean =
    (arr, r) => arr.reduce(
        (acc: boolean, el) => acc && r.test(el), true)
;

// export const reduceObj: <Acc, Iter = Acc>(obj: Iter, reducer: (acc: Acc, key: keyof Iter, val: Iter[keyof Iter]) => Acc, init: Acc) =
export const reduceObj = <Acc, Iter = Acc>(
    obj: Iter,
    reducer: Reducer2<Iter, Acc>,
    init: Acc
) => (Object.keys(obj) as (keyof Iter)[])
    .reduce(
        (acc, key) => reducer(acc, key, obj[key]),
        init
    )
;

/**
 * Chains a list of functions together. The value returned by the previous function
 * is passed to the next function. The last function call's result is returned.
 *
 * @param x The initial value passed to the first function
 * @param fns The list of functions to chain
 *
 * @returns The return value of the last function in `fns`
 */
export const C: <Acc, Res = Acc>(init: Acc, ...fns: Fn<[ last: Acc ], Acc>[]) => Res =
    (x, ...fns) => fns.reduce(
        (last, fn) => fn(last),
        x
    ) as any
;
