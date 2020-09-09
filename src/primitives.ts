import { Character, Rule, RuleDecorator, Context, PropertyContext, Predicate, ListRule } from "./types"
import { CHARS, line, $, LINETERM, LIST_RULE, throws } from "./util"

/**
 * ```
 * x-name   = "X-" [vendorid "-"] 1*(ALPHA / DIGIT / "-")
 * vendorid = 3*(ALPHA / DIGIT)
 * ```
 * @param xname
 */
export const X_NAME: Rule<string> = xname =>
    /^X-([a-zA-Z]{3,})-([a-zA-Z-]+)$/.test(xname)
        ? xname
        : throws(`Invalid x-name property "${xname}"`)

/**
 * ```
 *   iana-token = 1*(ALPHA / DIGIT / "-")
 *   // iCalendar identifier registered with IANA
 * ```
 * @param tok
 */
export const IANA_TOKEN: Rule<string> = tok =>
    /^[a-zA-Z-]+$/.test(tok)
        ? tok
        : throws(`Invalid IANA token "${tok}"`)

/**
 * Param rule.
 * ```
 * param = param-name "=" param-value *("," param-value)
 * ```
 * @param ctx
 */
export const rParam: Rule<string[]> =
    ([name, ...values]) => values.length
        ? `${name}=${values.join(",")}`
        : throws(`No values provided for param ${name}`)

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
export const rParams: Rule<string[][]> =
    params => params?.map(rParam).join(";") ?? ""
    ;
export const NAME: Rule<string> =
    name => /[A-Z]+/.test(name)
        ? name.toUpperCase()
        : throws(`Bad property name "${name}", property names must be nonempty strings.`)
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
 * ABNF:
 * ```
 * contentline = name *(";" param ) ":" value CRLF
 * ```
 *
 * From the [spec](https://icalendar.org/iCalendar-RFC-5545/3-1-1-list-and-field-separators.html):
 *
 * >   The iCalendar object is organized into individual lines of text, called
 *   *content lines*. Content lines are delimited by a line break, which is a `CRLF`
 *   sequence (`CR` character followed by `LF` character).
 *       Lines of text **SHOULD NOT**  be longer than 75 octets, excluding the
 *   line break. Long content lines **SHOULD** be split into a multiple line
 *   representations using a line "folding" technique. That is, a long line can
 *   be split between any two characters by inserting a `CRLF` immediately
 *   followed by a single linear white-space character (i.e., `SPACE` or `HTAB`).
 *       Any sequence of CRLF followed immediately by a single linear white-space
 *   character is ignored (i.e., removed) when processing the content type.
 *
 * > Some properties and parameters allow a list of values. Values in a list of
 *   values MUST be separated by a COMMA character. There is no significance to
 *   the order of values in a list. For those parameter values (such as those
 *   that specify URI values) that are specified in quoted-strings, the
 *   individual quoted-strings are separated by a COMMA character.
 *   - Some property values are defined in terms of multiple parts. These
 *     structured property values MUST have their value parts separated by a
 *     SEMICOLON character.
 *   - Some properties allow a list of parameters. Each property parameter in a
 *     list of property parameters MUST be separated by a SEMICOLON character.
 *   - Property parameters with values containing a COLON character, a SEMICOLON
 *     character or a COMMA character MUST be placed in quoted text.
 *
 * > For example, in the following properties, a SEMICOLON is used to separate
 *   property parameters from each other and a COMMA character is used to separate
 *   property values in a value list.
 *
 * @param ctx An object containing the properties name, parameters, and value.
 */
export const PROPERTY = (name: string, value: any, params: any[] | string = []) => (
    name?.length && !!value
        ? (
            params = !params.length ? "" : rParam(params as string[]),
            name = NAME(name),
            value = VALUE(name),
            `${name}${params}:${value}`
        )
        : throws("Content name or value was not provided")
)

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
export const COMPONENT: <T extends Context>(name: string, validate?: Predicate<T>) => Rule<T> =
    (name, isValid = () => true) => content => !isValid(content)
        ? throws(`Invalid content provided for component "${name}"`)
        : $(
            PROPERTY("BEGIN", name),
            ...Object.keys(content).map(key => PROPERTY(key, content[key].value, content[key].params)),
            PROPERTY("END", name),
        );
