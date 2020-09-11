/**
 * @file primitives.ts
 * @description Contains basic production rules that form the backbone of more complex objects
 *
 * @license MIT
 */
import { Rule, Context, PropertyContext, Predicate, ListRule } from "./types"
import { CHARS, $, LIST_RULE } from "./util"
import { throws } from "./lib"

const DQUOTE           = CHARS["DQUOTE"]
const X_NAME_REGEX     = /^X-([a-zA-Z]{3,})-([a-zA-Z-]+)$/
const IANA_TOKEN_REGEX = /^[a-zA-Z-]+$/

let _params: string[] | string;

/**
 * ```
 * x-name   = "X-" [vendorid "-"] 1*(ALPHA / DIGIT / "-")
 * vendorid = 3*(ALPHA / DIGIT)
 * ```
 * @param xname
 */
export const X_NAME: Rule<string> = xname =>
    X_NAME_REGEX.test(xname)
        ? xname
        : throws(`Invalid x-name property "${xname}"`)
;

/**
 * ```
 *   iana-token = 1*(ALPHA / DIGIT / "-")
 *   // iCalendar identifier registered with IANA
 * ```
 * @param tok
 */
export const IANA_TOKEN: Rule<string> = tok =>
    IANA_TOKEN_REGEX.test(tok)
        ? tok
        : throws(`Invalid IANA token "${tok}"`)
;

/**
 * @see {@link https://tools.ietf.org/html/rfc5545#section-3.2 iCal Spec S. 3.2}
 */
const ICAL_PARAMS: Record<string, Rule<unknown>> = {
    /**
     * 3.2.1 Alternate Text Representation - specifies a URI that points to an
     * alternate representation for a textual property value
     */
    "ALTREP": uri => DQUOTE + uri + DQUOTE,
    /**
     * 3.2.2 Common Name - specify the common name to be associated with the
     * calendar user specified by the property.
     */
    "CN": x => "todo",
    /**
     * 3.2.3 Calendar User Type - identifies the type of calendar user specified
     * by the property it belongs to.
     */
    "CUTYPE": x => "todo",
    // TODO add docs similarly to above
    /**
     * 3.2.4 Delegators
     */
    "DELEGATED-FROM": x => "todo",
    /**
     * 3.2.5 Delegatees
     */
    "DELEGATED-TO": x => "todo",
    /**
     * 3.2.6 Directory Entry Reference
     */
    "DIR": x => "todo",
    /**
     * 3.2.7 Inline Encoding
     */
    "ENCODING": x => "todo",
    /**
     * 3.2.8 Format Type
     */
    "FMTTYPE": x => "todo",
    /**
     * 3.2.9 Free/Busy Time Type
     */
    "FBTYPE": x => "todo",
    /**
     * 3.2.10 Language
     */
    "LANGUAGE": x => "todo",
    /**
     * 3.2.11 Group or List Member
     */
    "MEMBER": x => "todo",
    /**
     * 3.2.12 Participation Status
     */
    "PARTSTAT": x => "todo",
    /**
     * 3.2.13 Recurrence Identifier Range
     */
    "RANGE": x => "todo",
    /**
     * 3.2.14 Alarm Trigger Relationship
     */
    "RELATED": x => "todo",
    /**
     * 3.2.15 Relationship Type
     */
    "RELTYPE": x => "todo",
    /**
     * 3.2.16 Participation Role
     */
    "ROLE": x => "todo",
    /**
     * 3.2.17 RSVP Expectation
     */
    "RSVP": x => "todo",
    /**
     * 3.2.18 Sent By
     */
    "SENT-BY": x => "todo",
    /**
     * 3.2.19 Time Zone Identifier
     */
    "TZID": x => "todo",
    /**
     * 3.2.20 Value Data Types
     */
    "VALUE": x => "todo",
}

/**
 * Encodes 0 or more property parameters.
 *
 * From the [spec](https://icalendar.org/iCalendar-RFC-5545/3-2-property-parameters.html):
 * > A property can have attributes with which it is associated. These
 *   "property parameters" contain meta-information about the property or the
 *   property value. Property parameters are provided to specify such information
 *   as the location of an alternate text representation for a property value,
 *   the language of a text property value, the value type of the property
 *   value, and other attributes.
 *       Property parameter values that contain the COLON, SEMICOLON, or COMMA
 *   character separators MUST be specified as quoted-string text values.
 *   Property parameter values MUST NOT contain the DQUOTE character. The DQUOTE
 *   character is used as a delimiter for parameter values that contain restricted
 *   characters or URI text.
 *
 * @param params
 *
 * @see {@link https://icalendar.org/iCalendar-RFC-5545/3-2-property-parameters.html 3.2 Property Parameters}
 */
const PARAM: Rule<[ name: string, value: unknown ]> =
    ([ name, value ]) => (
        name = NAME(name),
        // Find the correct production rule for `value`, call the rule, and update
        // the value of `value` with the result
        value = (
            ICAL_PARAMS[name] ||
            X_NAME_REGEX.test(name) && X_NAME ||
            IANA_TOKEN_REGEX.test(name) && IANA_TOKEN ||
            throws(`Invalid property parameter name "${name}"`)
        )(value),
        `${name}=${value}`
    )
;

export const PARAMS: Rule =
    ctx => (
        _params = Object.keys(ctx),
        // Empty context means no parameters; return an empty string
        !_params.length
            ? ""
            : _params
                .map(name => PARAM([ name, ctx[name] ]))
                .join(";")
    )
;

export const NAME: Rule<string> =
    name => typeof name === "string" && /[a-zA-Z]+/.test(name)
        ? name.toUpperCase()
        : throws(
            `Bad property name "${name}", property names must be nonempty ` +
            `strings containing only letters.`
          )
;

/**
 * TODO
 */
export const VALUE: ListRule<any> = LIST_RULE<any>()(
    value => value
)

/**
 * Encodes an iCalendar content line.
 *
 * From the [spec](https://icalendar.org/iCalendar-RFC-5545/3-1-1-list-and-field-separators.html):
 *
 * > The iCalendar object is organized into individual lines of text, called
 *   *content lines*. Content lines are delimited by a line break, which is a `CRLF`
 *   sequence (`CR` character followed by `LF` character).
 *
 * This rule does not add a terminating `CRLF`, because the `$` helper function does it instead.
 *
 * content line ABNF:
 * ```
 * contentline = name *(";" param ) ":" value CRLF
 * ```
 *
 * @param ctx An object containing the properties name, parameters, and value.
 * @see {@link https://tools.ietf.org/html/rfc5545#section-3.1 Section 3.1}
 */
export const PROPERTY: (name: string, value: any, params?: Record<string, any>) => string =
    (name, value, params = {}) => (
        name?.length && !!value
            ? (
                _params = params ? PARAMS(params) : "",
                name    = NAME(name),
                value   = VALUE(name),
                `${name}${_params}:${value}`
              )
            : throws("Content name or value was not provided")
    )
;

/**
 * Factory function that creates a Component rule.
 *
 * ```
 * component = "BEGIN" ":" name CRLF
 *             1*contentline
 *             "END" ":" name CRLF
 * ```
 *
 * @param name
 * @param isValid
 */
export const COMPONENT: <T extends Context>(
    name: string,
    validate?: Predicate<T>
) => Rule<T> =
    // *a comment for visually-aesthetic separation*
    (name, isValid = () => true) => content =>
        !isValid(content)
            ? throws(`Invalid content provided for component "${name}"`)
            : $(
                PROPERTY("BEGIN", name),
                ...Object.keys(content).map(
                    key => PROPERTY(key, content[key].value, content[key].params)
                ),
                PROPERTY("END", name),
               )
;
