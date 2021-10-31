import { Reducer2 } from "../src"
import { $, LINETERM } from "../src/util"



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
