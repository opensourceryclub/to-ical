/**
 * @file datatypes.ts
 */
import { Rule, ListRule } from "./types"
import { LIST_RULE, num, CHARS } from "./util"
import { throws, checkAll, C } from "./lib"

export const encodeIcsVal: Rule<any> = val => {
    switch (typeof val) {
        case "boolean":
            return String(val).toUpperCase()
        case "number":
            return String(val)
        case "undefined":
        case "object": // val could be null or undefined; typeof null == "object"
            return Object.keys(val ?? {}).reduce(
                // ;KEY=VALUE + ACC
                (acc, key) => `;${encodeIcsVal(key)}=${encodeIcsVal(val[key])}${acc}`,
                ";");
        case "string":
        default:
            return val.toUpperCase();
    }
}

/**
 * @param x
 * @see {@link https://tools.ietf.org/html/rfc5545#section-3.3.2 iCalendar Sec 3.3.2}
 */
export const BOOLEAN: Rule<[ bool: boolean ]> =
    x => x ? "TRUE" : "FALSE"
;

/**
 * @param x
 * @see {@link https://tools.ietf.org/html/rfc5545#section-3.3.3 iCalendar Sec 3.3.3}
 */
export const CAL_ADDRESS: Rule<unknown> =
    x => x instanceof URL
        ? x.toString() as string
        : typeof x !== "string"
            ? throws("Bad calendar address, must be a URL or string.")
            : x
;

/**
 * ```
 * date               = date-value
 * date-value         = date-fullyear date-month date-mday
 * date-fullyear      = 4DIGIT
 * date-month         = 2DIGIT        ;01-12
 * date-mday          = 2DIGIT        ;01-28, 01-29, 01-30, 01-31
 *                                    ;based on month/year-
 * ```
 * @param date
 * @see {@link https://tools.ietf.org/html/rfc5545#section-3.3.4 iCalendar Sec 3.3.4}
 */
export const DATE: ListRule<Date> = LIST_RULE<Date>()(
    date => {
        let year = date.getFullYear().toString(),
            month = date.getMonth().toString().padStart(2, "0"),
            day = date.getDate().toString().padStart(2, "0")

        // No separator between date component text
        return year + month + day
    })
;

/**
 * ### 3.3.11.  Text
 *
 * - Value Name: Text
 *
 * - Purpose: This value type is used to identify values taht contain
 *   human-readable
 *   text.
 *
 * - Format Definition: This value type is defined by the following notation:
 * ```
 * text = *(TSAFE-CHAR / ":" / DQUOTE / ESCAPED-CHAR)
 * ESCAPED-CHAR = ("\\" / "\;" / "\," / "\N" / "\n")
 * TSAFE-CHAR = <any character except CONTROLs not needed by the current
 *              character set, DQUOTE, ";", ":", "\", or ",">
 *```
 *
 * @param txt
 * @see {@link https://tools.ietf.org/html/rfc5545#section-3.3.12 iCalendar Sec 3.3.12}
 */
export const TEXT: Rule<any> = LIST_RULE<any>()(
    txt => C(
        String(txt),
        // cannot have " character b/c it's used as a delimiter for values that
        // contain restricted characters or URI text
        txt => txt.includes('"')
            ? throws ("Text values cannot have double quotes in them")
            : txt,
        // Escape ";", ":", "\", "," and newline characters
        txt => txt
            .replace(/;/g, "\\;")
            .replace(/,/g, "\\,")
            .replace(/\\/g, "\\\\")
            .replace(/\n\r|\n/g, "\\n"), // Regex's character order matters
        // If the string has a colon, semicolon, or comma, escape it
        txt => /[:;,]/.test(txt)
            ? `"${txt}"`
            : txt
    )
)

/**
 *
 * ### 3.3.12.  Time
 *
 * - Value Name:  TIME
 *
 * - Purpose:  This value type is used to identify values that contain a time of day.
 *
 * - Format Definition:  This value type is defined by the following notation:
 * ```
 *     time         = time-hour time-minute time-second [time-utc]
 *
 *     time-hour    = 2DIGIT        ;00-23
 *     time-minute  = 2DIGIT        ;00-59
 *     time-second  = 2DIGIT        ;00-60
 *     ;The "60" value is used to account for positive "leap" seconds.
 *
 *     time-utc     = "Z" ; only included when time is an absolute time
 * ```
 *
 * Note that encoded times conform to Form #3 *only* as specified in Sec. 3.3.12
 *
 * @param x
 * @see {@link https://tools.ietf.org/html/rfc5545#section-3.3.12 iCalendar Sec 3.3.12}
 */
export const TIME: Rule<{ hour: string, min?: string, sec?: string }> =
    ({ hour, min = "00", sec = "00" }) =>
        checkAll([hour, min, sec], /^\d{2}$/)
            ? hour + min + sec
            : throws("Bad input. Time string components must ")
;

export const TIME_FROM_DATE: Rule<Date> = time => {
    let [hour, min, sec] = [
        time.getHours(),
        time.getMinutes(),
        time.getSeconds()
    ].map(num());

    return TIME({ hour, min, sec })
}

/**
 * ### 3.3.5 DateTime
 * ```
 * date-time = date "T" time
 * ```
 * Only creates datetimes that conform to form #3: dates with local time and
 * time zone reference
 *
 * @param datetime
 * @see {@link https://tools.ietf.org/html/rfc5545#section-3.3.5 iCalendar Spec, S 3.3.5}
 */
export const DATETIME =
    LIST_RULE<Date>()(datetime =>
        DATE(datetime) + CHARS["L_CAP_Z"] + TIME_FROM_DATE(datetime)
    )
;

/**
 * ### 3.3.13 URI
 *
 * Format Definition:
 * ```
 * uri = <uri string, defined in RFC 3986>
 * ```
 *
 * @see {@link https://tools.ietf.org/html/rfc5545#section-3.3.13 iCalendar Spec, S 3.3.13}
 * @see {@link https://tools.ietf.org/html/rfc3986#section-3 URI Spec, S 3}
 */
export const URI: Rule<unknown> =
    uri => uri instanceof URL
        ? uri.toString()
        : typeof uri === "string"
            ? new URL(uri).toString()
            : throws(
                "Bad URI data, expected a string or URL instance, got a " +
                ((uri as any).constructor?.name ?? typeof uri)
              )
;
