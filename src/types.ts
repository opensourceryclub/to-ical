export type Fn<P = undefined, R = any> =
    P extends  null | undefined
        ? () => R
    : P extends [...infer Q]
        ? (...args: Q) => R
    // : P extends infer Q
    //     ? (arg: Q) => R
    : (arg: P) => R
;

type Arity1Function<T, U = void> = (arg: T) => U
type ArityFunction<T, U = void> = T extends [...infer R]
    ? (...arg: R) => U
    : (arg: T) => U
;
type Bar = ArityFunction<[ p: boolean, q: boolean ]>
type Baz = ArityFunction<boolean>
type Bang = Arity1Function<boolean>
// type Bang = ArityFunction<[]>
type MyReducer<A, E = A> = ArityFunction<[accumulator: A, currElem: E], A>
// type Baz = ArityFunction<boolean>
type IdentityFn<T> = T extends any[] ? ArityFunction<[T], T> : ArityFunction<T, T>
type NumberIdentity = IdentityFn<number[]>
export type Thunk<T> = Fn<[], T>

// export type Predicate<T = any> = (x?: T) => boolean;
export type Predicate<T = any> = Fn<[p: T], boolean>
export type Reducer<El, PAcc = El, RAcc = PAcc> = (acc: PAcc, el: El) => RAcc
export type Reducer2<Iter, Acc = Iter> = Fn<[acc: Acc, key: keyof Iter, value: Iter[keyof Iter]], Acc>
export type Falsey = "" | false | 0 | undefined | null

// =============================== ENCODER TYPES ===============================

// Contexts
// export type Context<K extends string = string> =
//     Record<K, any | undefined>
// ;
/**
 * Base type for all Rule data contexts.
 *
 * This type definition looks worse than it is. It's effectively just a very
 * configurable Record. This is used over a Record because the Record type obscures
 * type definitions when values have heterogeneous values.
 *
 * @type {T} An object defining the shape of the Context. The Context's type is
 * effectively just `T`, but a few constraints are enforced. For example, `T`
 * can only have string keys (no symbols or numbers).
 *
 * @type {K} The keys in T that are available to the Rule. This exists in case
 * you want to constrain/expand the properties available in the context. All
 * keys must be strings.
 *
 * @see Rule
 * @see Record
 */
export type Context<
    T extends Record<string, any> = Record<string, any | undefined>,
    K extends string = Extract<keyof T, string>
> = {
    [P in K]: (
        T[P] extends undefined
            ? undefined
            : T[P]
    )
}

export interface PropertyContext<T = any> {
    name: string
    params: any[]
    value: T
}

export interface RootContext extends Context {
    prodId: string
    icsVersion?: string
    calscale?: string
    method?: string
    xComps?: NonNormativeContext[]
    ianaComps?: NonNormativeContext[]
    events?: Context[]
}

/**
 * Parent type for data contexts passed to a Component rule. All component's context types
 * inherit this type.
 *
 * @param T A record that maps
 */
export type ComponentContext<T extends Context, K extends keyof T = keyof T> = {
    [P in K]: Omit<PropertyContext<T[P]>, "name">
}

export type EventContext = ComponentContext<EventProperties>

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
    T extends Context = Context,
    K extends keyof T = keyof T
> {
    /**
     * Name of the non-normative component
     */
    name: string
    /**
     * Component context data
     */
    content: ComponentContext<T, K>
}

// Rules
export type Rule<T = Context> =
    (ctx: T) => string
;

export type ListRule<T = Context> =
    Rule<T | T[]>
;

export type RuleDecorator<T = Context, U = T> =
    Fn< Rule<T>, Rule<U> >
;

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
