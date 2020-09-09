import { Reducer2 } from "../src"
import { throws, reduceObj, $, LINETERM } from "../src/util"

const clone: <R = any, T extends Array<any> = any[]>(...objects: T) => R =
    (...args) => Object.assign({}, ...args)
/**
 * "throws()" spec
 */
describe("throws()", () => {
    const err = new Error("Some existing error object to throw")

    it("accepts a message string and throws an Error", () => {
        expect(() => throws("Oops!")).toThrowError("Oops!")
        const yourFn: (x: number) => string | never =
            x => x > 10
                ? "Param is greater than 10"
                : throws("Param must be greater than 10");
        expect(yourFn(11)).toEqual("Param is greater than 10")
        expect(() => yourFn(9)).toThrow()
    })
    it("accepts an error object and throws it", () => {
        const err = new Error("Some existing error object to throw")
        expect(() => throws(err)).toThrowError(err)
    })
    it("accepts a thunk and throws whatever it returns", () => {
        const errThunk = () => err
        const msgThunk = () => "error message"
        expect(() => throws(errThunk)).toThrowError(err)
        expect(() => throws(msgThunk)).toThrowError("error message")
    })
}) // !throws

/**
 * "reduceObj()" spec
 */
describe("reduceObj()", () => {
    // Mock reducer functions
    const identityReducer = jest.fn((acc, key, val) => acc)
    const accBuilderReducer = jest.fn((acc, key, val) => (acc[key] = val, acc))

    // Initial shapes of testing objects
    const _startingAcc = {
        startingValue: "Set on the starting accumulator object",
    }
    const _iter = {
        foo: "foo",
        bar: "bar",
        baz: {
            a: 1,
            b: true,
        },
        c: [1, 2, 3],
        d: false
    }

    // Testing objects. Set to its respective starting value on reset.
    let emptyStartingAcc = {}
    let populatedStartingAcc: typeof _startingAcc = clone(_startingAcc)
    let iter: typeof _iter = clone(_iter)
    let numKeys: number = Object.keys(iter).length;

    // Reset mocks, test objects, etc.
    const reset = () => {
        identityReducer.mockClear()
        accBuilderReducer.mockClear()
        iter = clone(_iter)
        numKeys = Object.keys(iter).length
        emptyStartingAcc = {}
        populatedStartingAcc = clone(_startingAcc)

        global.gc?.()
    }

    beforeEach(reset)

    it.each((
        reset(), [
            [iter, identityReducer,   emptyStartingAcc,     emptyStartingAcc],
            [iter, accBuilderReducer, emptyStartingAcc,     iter],
            [iter, accBuilderReducer, populatedStartingAcc, clone(iter, populatedStartingAcc)],
        ] as Array<[iterable: any, reducer: Reducer2<Record<string, any>>, initAcc: any, expected: any]>
    ))("Reduces over an object", (obj, reducer, init, expected) => {
        let actual: any;

        actual = reduceObj(obj, reducer, init)
        expect(actual).toEqual(expected)
        expect(reducer).toHaveBeenCalledTimes(numKeys)
    })
}) // !reduceObj

describe("$()", () => {
    it("builds an iCalendar block from one or more lines", () => {
        expect($("foo")).toBe("foo" + LINETERM)
        expect($("foo", "bar")).toBe("foo" + LINETERM + "bar" + LINETERM)
    })
    it("ignores falsey inputs", () => {
        expect($("foo", 0, false, null, undefined, "bar", null)).toBe("foo" + LINETERM + "bar" + LINETERM)
        expect($("")).toBe("")
        expect($()).toBe("")
        expect($("", null, false, undefined)).toBe("")
        expect($(null, undefined, 0, false, "foo", null, 0, false, undefined)).toBe("foo" + LINETERM)
    })
})
