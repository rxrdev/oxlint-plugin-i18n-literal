/**
 * Universal ignore lists — entries that are machine-facing in any codebase,
 * regardless of framework or component library. Anything specific to a
 * library belongs in `./presets/`.
 */

/** Standard HTML and ARIA attributes whose values are never user-visible copy. */
const HTML_ATTRIBUTES = [
    'style', 'type', 'id', 'name', 'data-testid', 'data-id', 'target', 'href',
    'src', 'role', 'aria-labelledby', 'aria-describedby', 'value', 'maxLength',
    'minLength', 'pattern', 'inputMode', 'autoComplete', 'rel', 'method',
    'action', 'variant', 'encType', 'accept', 'acceptCharset', 'accessKey',
    'tabIndex', 'contentEditable', 'draggable', 'spellCheck', 'translate',
    'slot', 'part', 'exportparts', 'is', 'itemProp', 'itemScope', 'itemType',
    'itemID', 'itemRef', 'checked', 'selected', 'disabled', 'readOnly',
    'required', 'hidden', 'min', 'max', 'step', 'rows', 'cols', 'size', 'span',
    'colSpan', 'rowSpan', 'width', 'height', 'loading', 'sizes', 'media',
    'integrity', 'nonce', 'referrerPolicy', 'ariaLabelledBy', 'ariaDescribedBy',
    'ariaHidden', 'ariaLive', 'ariaAtomic', 'ariaBusy', 'ariaRelevant',
    'ariaModal', 'ariaOwns', 'ariaFlowTo', 'ariaActiveDescendant',
    'ariaControls', 'ariaDescribedby', 'ariaDetails', 'ariaErrormessage',
    'ariaHaspopup', 'ariaInvalid', 'ariaKeyshortcuts', 'ariaRoledescription',
];

/** SVG presentation and geometry attributes: paths, colours, coordinates. */
const SVG_ATTRIBUTES = [
    'xmlns', 'xmlnsXlink', 'viewBox', 'preserveAspectRatio', 'fill',
    'fillOpacity', 'fillRule', 'clipRule', 'clipPath', 'stroke', 'strokeWidth',
    'strokeDasharray', 'strokeDashoffset', 'strokeLinecap', 'strokeLinejoin',
    'strokeMiterlimit', 'strokeOpacity', 'vectorEffect', 'transform',
    'transformOrigin', 'gradientUnits', 'gradientTransform', 'patternUnits',
    'stopColor', 'stopOpacity', 'markerEnd', 'markerMid', 'markerStart',
    'mask', 'filter', 'opacity', 'points', 'd', 'x', 'y', 'x1', 'y1', 'x2',
    'y2', 'dx', 'dy', 'cx', 'cy', 'r', 'rx', 'ry', 'offset', 'textAnchor',
    'dominantBaseline',
];

export const UNIVERSAL_ATTRIBUTES = [...HTML_ATTRIBUTES, ...SVG_ATTRIBUTES];

export const UNIVERSAL_COMPONENTS = [
    'Trans', 'Translation', 'Suspense', 'Fragment', 'StrictMode', 'Profiler',
];

export const UNIVERSAL_FUNCTIONS = [
    't', 'i18n.t', 'i18next.t',
    'console.log', 'console.warn', 'console.error', 'console.info',
    'console.debug', 'console.trace', 'console.table', 'console.time',
    'console.timeEnd', 'console.group', 'console.groupEnd', 'console.assert',
    'parseInt', 'parseFloat', 'Number', 'String', 'Boolean', 'Array', 'Object',
    'Date', 'JSON.parse', 'JSON.stringify',
    'localStorage.getItem', 'localStorage.setItem', 'localStorage.removeItem',
    'sessionStorage.getItem', 'sessionStorage.setItem',
    'sessionStorage.removeItem',
    'document.querySelector', 'document.querySelectorAll',
    'document.getElementById', 'document.getElementsByClassName',
    'document.getElementsByTagName',
    'fetch',
    'formatDate', 'formatCurrency', 'formatNumber', 'formatPercentage',
    'formatDateTime', 'formatRelativeTime',
    'cn', 'clsx', 'classNames', 'cva', 'twMerge',
    'require',
    'describe', 'it', 'test', 'expect', 'beforeEach', 'afterEach', 'beforeAll',
    'afterAll', 'jest.fn', 'jest.mock', 'vi.fn', 'vi.mock',
    'logger.info', 'logger.warn', 'logger.error', 'logger.debug',
    'logger.trace', 'logger.fatal',
];

export const UNIVERSAL_FUNCTION_PREFIXES = [
    'Math.', 'window.location.', 'window.history.', 'window.navigator.',
];

export const UNIVERSAL_PATTERNS = [
    /^[A-Z_][A-Z0-9_]*$/,
    /^[a-z_][a-z0-9_]*$/,
    /^\d+$/,
    /^\d+\+$/,
    /^[\d.,/-]+$/,
    /^\$[\d.,]+$/,
    /^[\d]+%$/,
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    /^https?:\/\//,
    /^#[a-fA-F0-9]{3,8}$/,
    /^(rgb|rgba|hsl|hsla)\(/,
    /^\s*$/,
    /^[!@#$%^&*()_+=[\]{};:'",.<>/?\\|-]+$/,
    /^\W+$/,
    /^\.{1,3}$/,
    /^[a-z0-9-]+$/,
    // Single camelCase token, e.g. `myRequests`. These are prop/field
    // identifiers; user-visible copy is never one bumpy word. At least one
    // hump is required so this stays narrower than the lowercase pattern above.
    /^[a-z][a-z0-9]*([A-Z][a-z0-9]*)+$/,
    // BCP-47 language tags such as `de-DE`, `pt-BR`, or `zh-Hans-CN`.
    /^[a-z]{2,3}(-[A-Z][a-z]{3})?(-([A-Z]{2}|\d{3}))?$/,
    /^&[a-zA-Z]+;$/,
    /^(calc|var|blur|rotate|scale|translate|url|linear-gradient|radial-gradient)\(/,
    /^-?\d+(\.\d+)?(px|em|rem|%|vh|vw|deg|s|ms)$/,
];
