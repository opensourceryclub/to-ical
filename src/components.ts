import { Rule, ListRule, Context, RootContext, NonNormativeContext, EventContext } from "./types"
import { $, LIST_RULE } from "./util"
import { throws } from "./lib"
import { PROPERTY, X_NAME, COMPONENT, IANA_TOKEN } from "./primitives";

/**
 * Encodes a data context object into an iCalendar-compliant string.
 * @param icalbody
 *
 * @see {@link https://tools.ietf.org/html/rfc5545#section-3.4 3.4 - The iCalendar Object}
 */
export const ICAL: Rule<RootContext> = icalbody => $(
    "BEGIN:VCALENDAR",
    ICAL_BODY(icalbody),
    "END:VCALENDAR"
)

export const ICAL_BODY: Rule<RootContext> = ({
    // Required properties
    prodId,
    icsVersion = "2.0",
    // Optional, may only occur once
    calscale,
    method,
    // Optional, may occur more than once
    xComps,
    ianaComps,
    events,
}) => (
        // prodId property is required
        !prodId && throws("No prodId provided."),
        // Throw an error if all arrays are empty
        !(events?.length || ianaComps?.length || xComps?.length) &&
        throws("You must include at least one component"),
        $(
            PROPERTY("PRODID", prodId),
            PROPERTY("VERSION", icsVersion),
            events    && EVENT(events),
            ianaComps && IANA_COMP(ianaComps),
            xComps    && XCOMP(xComps)
        )
    )
;

/**
 * ### 3.6.1 Event Component
 *
 * @see {@link https://tools.ietf.org/html/rfc5545#section-3.6.1 Sec 3.6.1 - Event Component}
 */
export const EVENT: ListRule<EventContext> =
    LIST_RULE("")(COMPONENT("VEVENT"))
;
export const IANA_COMP: ListRule<NonNormativeContext> =
    LIST_RULE<NonNormativeContext>("")(
        ({ name: token, content }) => COMPONENT(IANA_TOKEN(token))(content)
    )
;
export const XCOMP: ListRule<NonNormativeContext> =
    LIST_RULE<NonNormativeContext>("")(
        ({ name, content }) => COMPONENT(X_NAME(name))(content)
    )
;
