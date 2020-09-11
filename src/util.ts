import { Rule, ListRule, Character, RuleDecorator, Context, Falsey, Thunk,  Reducer2 } from "./types"
import { throws, reduceObj } from "./lib"

/**
 * Temp variable to enable functional programming.
 */
let tmp: any;

/**
 * @see {@link https://tools.ietf.org/html/rfc5545#section-3.3 iCal Data Types}
 */
export enum DataType {
    BINARY           = "BINARY",             // 3.3.1
    BOOLEAN          = "BOOLEAN",            // 3.3.2
    CAL_USER_ADDRESS = "CAL_USER_ADDRESS",   // ...
    DATE             = "DATE",
    DATETIME         = "DATETIME",
    DURATION         = "DURATION",
    FLOAT            = "FLOAT",
    INTEGER          = "INTEGER",
    TIME_PERIOD      = "TIME_PERIOD",
    RRULE            = "RRULE",
    TEXT             = "TEXT",
    TIME             = "TIME",
    URI              = "URI",
    UTC_OFFSET       = "UTC_OFFSET"
}


/**
 * @see {@link https://icalendar.org/iCalendar-RFC-5545/2-1-formatting-conventions.html ICal Formatting Conventions}
 *
 * ```
 *  +------------------------+-------------------+
 *  | Character name         | Decimal codepoint |
 *  +------------------------+-------------------+
 *  | HTAB                   | 9                 |
 *  | LF                     | 10                |
 *  | CR                     | 13                |
 *  | DQUOTE                 | 22                |
 *  | SPACE                  | 32                |
 *  | PLUS SIGN              | 43                |
 *  | COMMA                  | 44                |
 *  | HYPHEN-MINUS           | 45                |
 *  | PERIOD                 | 46                |
 *  | SOLIDUS                | 47                |
 *  | COLON                  | 58                |
 *  | SEMICOLON              | 59                |
 *  | LATIN CAPITAL LETTER N | 78                |
 *  | LATIN CAPITAL LETTER T | 84                |
 *  | LATIN CAPITAL LETTER X | 88                |
 *  | LATIN CAPITAL LETTER Z | 90                |
 *  | BACKSLASH              | 92                |
 *  | LATIN SMALL LETTER N   | 110               |
 *  +------------------------+-------------------+
 * ```
 */
export const CHARS: Record<Character, string> =
    reduceObj(
        {
            HTAB: 9,
            LF: 10,
            CR: 13,
            DQUOTE: 22,
            SPACE: 32,
            PLUS_SIGN: 43,
            COMMA: 44,
            HYPHEN_MINUS: 45,
            PERIOD: 46,
            SOLIDUS: 47,
            COLON: 58,
            SEMICOLON: 59,
            L_CAP_N: 78,
            L_CAP_T: 84,
            L_CAP_X: 88,
            L_CAP_Z: 90,
            BACKSLASH: 92,
            L_SMALL_N: 110
        },
        (acc, key, value) => (acc[key] = String.fromCharCode(value), acc),
        {} as Record<Character, string>
    );

export const LINETERM: string = CHARS["CR"] + CHARS["LF"]

/**
 * ```
 * LINE(fn, x) => fn(x) + CRLF
 * CRLF => 1310
 * ```
 * @param fn
 */
export const line: RuleDecorator =
    fn => ctx => `${fn(ctx)}${LINETERM}`

/**
 * Creates a properly-terminated iCalendar object. Each line is a line to
 * add to the final iCalendar file. Falsey values are ignored.
 *
 * Each line in `lines` has the proper line terminator appended to its end. The
 * lines are then joined into a single string, resulting in a chunk of text that
 * is properly formatted and conforms to the iCalendar spec.
 *
 * ```ts
 * $("foo") // => "foo\r\n"
 * $("foo", "bar") // => "foo\r\nbar\r\n"
 * $("foo", false, "bar", null, undefined, 0) // => "foo\r\nbar\r\n"
 * ```
 *
 * @param lines The lines to format. Falsey values are ignored.
 *
 * @returns an iCalendar-compliant block of text
 */
export const $: (...lines: (string | Falsey)[]) => string =
    (...lines) =>
        lines.reduce((acc: string, ln) => (
            !ln // If the input line is null, just ignore it.
                ? acc
                : acc + ln + LINETERM
        ), "")

/**
 * Encodes a number `x` as an `nDIGIT` string, where `n` is the length of the
 * string. Numbers that have fewer than `n` digits are 0-padded.
 *
 * ```ts
 * num()(12)   // => "12"
 * num()(1)    // => "01"
 * num(2)(1)   // => "01"
 * num(4)(9)   // => "0009"
 * num(2)(100) // throws an Error
 * ```
 * @param n The number of digits `x` should have. Defaults to `2`.
 * @throws  If `x` has more than `n` digits
 *
 * @returns `n` encoded as a 0-padded string
 */
export const num: (n?: number) => Rule<number> =
    (n = 2) => x => (
        tmp = x.toString().padStart(n, "0"), // Encode and 0-pad the number
        tmp.length === n                     // Throw if it has more than `n` digits
            ? tmp
            : throws(`Bad input number "${x}", expected a number with ${n} digits.`)
    )

/**
 * Helper that creates a list rule function.
 *
 * This function decorates a given `rule` that accepts a parameter of type `T`,
 * creating a rule that accepts type `T | T[]`.
 *
 * When the input is a list, the inputs are processed and the results
 * are `join()`ed using `sep`. `sep` defaults to `","`.
 * Decorates a rule to accept an input `T` or a list of `T`s, creating a
 * comma separated list (CSL) if the input is a list.
 *
 * Below is a semi-formal description of what is going on
 * ```
 * LIST_RULE(RULE<T>) => RULE<T | T[]>
 * ```
 *
 * @param sep  The separator string to use when joining elements of the processed
 * @param rule The production rule to decorate.
 */
export const LIST_RULE: <T = Context>(sep?: string) => (rule: Rule<T>) => ListRule<T> =
    (sep = ",") => rule => maybeArr => maybeArr instanceof Array
        ? maybeArr.map(rule).join(sep)
        : rule(maybeArr)
