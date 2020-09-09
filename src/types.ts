
export type Thunk<T> = () => T
export type Predicate<T = any> = (x?: T) => boolean;
export type Reducer<El, PAcc = El, RAcc = PAcc> = (acc: PAcc, el: El) => RAcc
/**
 * Arity 2 Reducer function
 */
// export type Reducer2<R, P extends R = R, X = keyof P, Y = P[keyof P]> = (acc: P, x: X, y: Y) => R
export type Reducer2<Iter, Acc = Iter> = (acc: Acc, k: keyof Iter, v: Iter[keyof Iter]) => Acc;
export type Falsey = "" | false | 0 | undefined | null
// =============================== ENCODER TYPES ===============================

// Contexts
export type Context<K extends string = string> =
    Record<K, any | undefined>
;
export interface PropertyContext extends Context {
    name: string
    params: any[]
    value: any
}

export interface RootContext {
    prodId: string;
    icsVersion?: string;
    calscale?: string;
    method?: string;
    xComps?: NonNormativeContext[]
    ianaComps?: NonNormativeContext[]
    events?: Context[]
}

export type ComponentContext<
    T = any,
    K extends keyof T = keyof T,
> =
    Record<K, {
        value: T[K]
        params?: any[]
    }>
;

export type EventContext =
    ComponentContext<EventProperties>
;
export interface EventProperties {
    // Required, must not occur more than once
    UID: string;
    DTSTAMP: string;
    // Required if iCal obj doesn't specify a METHOD, optional otherwise.
    // Must not occur more than once.
    DTSTART?: string;
    // Optional, must not occur more than once
    CLASS?: string;
    CREATED?: string;
    DESCRIPTION?: string;
    GEO?: string;
    LAST_MOD?: string;
    LOCATION?: string;
    ORGANIZER?: string;
    PRIORITY?: string;
    SEQ?: string;
    STATUS?: string;
    SUMMARY?: string;
    TRANSP?: string;
    URL?: string;
    RECURID?: string;
    // Optional, should not occur more than once
    RRULE?: string;
    DTEND?: string;
    // Optional, cannot occur in the same eventprop
    DURATION?: string;
    // Optional, may occur more than once
    ATTACH?: string;
    ATTENDEE?: string;
    CATEGORIES?: string;
    COMMENT?: string;
    CONTACT?: string;
    EXDATE?: string;
    RSTATUS?: string;
    RELATED?: string;
    RESOURCES?: string;
    RDATE?: string;
    XPROP?: string;
    IANAPROP?: string;
}


/**
 * Represents a Context for a non-standard component. A non-standard component
 * is either an IANA component or an experimental, vendor specific component
 * (X-Component)
 */
export interface NonNormativeContext<
    K extends string = string,
    T extends ComponentContext<K> = ComponentContext<K>
> {
    name: string;
    content: T;
}

// Rules
export type Rule<T = Context> =
    (ctx: T) => string
;
export type ListRule<T = Context> =
    Rule<T | T[]>
;
export type RuleDecorator<T = Context, U = T> =
    (fn: Rule<T>) => Rule<U>
;

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

// Etc.
export type Character =
    | 'HTAB'
    | 'LF'
    | 'CR'
    | 'DQUOTE'
    | 'SPACE'
    | 'PLUS_SIGN'
    | 'COMMA'
    | 'HYPHEN_MINUS'
    | 'PERIOD'
    | 'SOLIDUS'
    | 'COLON'
    | 'SEMICOLON'
    | 'L_CAP_N'
    | 'L_CAP_T'
    | 'L_CAP_X'
    | 'L_CAP_Z'
    | 'BACKSLASH'
    | 'L_SMALL_N'
;
