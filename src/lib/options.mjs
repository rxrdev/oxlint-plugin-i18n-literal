import {
    UNIVERSAL_ATTRIBUTES,
    UNIVERSAL_COMPONENTS,
    UNIVERSAL_FUNCTION_PREFIXES,
    UNIVERSAL_FUNCTIONS,
    UNIVERSAL_PATTERNS,
} from './defaults.mjs';
import { PRESETS } from './presets/index.mjs';

const SETTINGS_KEY = 'i18n-literal';
const DEFAULT_PRESETS = ['react'];
const DEFAULT_TRANSLATION_FUNCTIONS = ['t', 'i18n.t', 'i18next.t'];

function toArray(value) {
    if (value == null) {
        return [];
    }

    return Array.isArray(value) ? value : [value];
}

function compileRegex(pattern, optionName) {
    if (pattern instanceof RegExp) {
        return pattern;
    }

    try {
        return new RegExp(pattern);
    } catch {
        throw new Error(
            `i18n-literal: invalid ${optionName} regex: ${pattern}`,
        );
    }
}

/**
 * Collects the named presets into one additive bundle.
 *
 * @param {string[]} names
 */
function collectPresets(names) {
    const bundle = {
        attributes: [],
        components: [],
        functions: [],
        patterns: [],
        errorHelperFunctions: [],
        checkElysiaRouteDetails: false,
    };

    for (const name of names) {
        const preset = PRESETS[name];

        if (!preset) {
            throw new Error(
                `i18n-literal: unknown preset "${name}". Available: ${Object.keys(PRESETS).join(', ')}`,
            );
        }

        bundle.attributes.push(...toArray(preset.attributes));
        bundle.components.push(...toArray(preset.components));
        bundle.functions.push(...toArray(preset.functions));
        bundle.patterns.push(...toArray(preset.patterns));
        bundle.errorHelperFunctions.push(...toArray(preset.errorHelperFunctions));

        if (preset.checkElysiaRouteDetails) {
            bundle.checkElysiaRouteDetails = true;
        }
    }

    return bundle;
}

/**
 * Builds a Set from defaults plus extensions, unless a replacement list is
 * given — in which case the replacement wins outright.
 */
function toSet(defaults, extensions, replacements) {
    if (replacements && replacements.length > 0) {
        return new Set(replacements);
    }

    return new Set([...defaults, ...extensions]);
}

/**
 * Resolves the effective configuration for one rule invocation.
 *
 * Shared keys come from `settings['i18n-literal']`; per-rule keys come from
 * the rule's own options. Both are merged over universal defaults and the
 * selected presets.
 *
 * @param {object} context oxlint rule context
 */
export function resolveOptions(context) {
    const shared = context.settings?.[SETTINGS_KEY] ?? {};
    const own = context.options?.[0] ?? {};
    const read = (key) => [...toArray(shared[key]), ...toArray(own[key])];
    const replacement = (key) => {
        const value = [...toArray(shared[key]), ...toArray(own[key])];

        return value.length > 0 ? value : null;
    };

    const presetNames = shared.presets ?? own.presets ?? DEFAULT_PRESETS;
    const presets = collectPresets(toArray(presetNames));

    return {
        ignoredAttributes: toSet(
            [...UNIVERSAL_ATTRIBUTES, ...presets.attributes],
            read('ignoredAttributes'),
            replacement('replaceIgnoredAttributes'),
        ),
        ignoredComponents: toSet(
            [...UNIVERSAL_COMPONENTS, ...presets.components],
            read('ignoredComponents'),
            replacement('replaceIgnoredComponents'),
        ),
        ignoredFunctions: toSet(
            [...UNIVERSAL_FUNCTIONS, ...presets.functions],
            read('ignoredFunctions'),
            replacement('replaceIgnoredFunctions'),
        ),
        ignoredFunctionPrefixes:
            replacement('replaceIgnoredFunctionPrefixes') ?? [
                ...UNIVERSAL_FUNCTION_PREFIXES,
                ...read('ignoredFunctionPrefixes'),
            ],
        ignorePatterns: [
            ...UNIVERSAL_PATTERNS,
            ...presets.patterns,
            ...read('ignorePatterns').map((pattern) =>
                compileRegex(pattern, 'ignorePatterns'),
            ),
        ],
        errorHelperFunctions: toSet(
            presets.errorHelperFunctions,
            read('errorHelperFunctions'),
            replacement('replaceErrorHelperFunctions'),
        ),
        translationFunctionNames: new Set([
            ...DEFAULT_TRANSLATION_FUNCTIONS,
            ...read('translationFunctionNames'),
        ]),
        checkElysiaRouteDetails:
            own.checkElysiaRouteDetails ??
            shared.checkElysiaRouteDetails ??
            presets.checkElysiaRouteDetails,
        checkErrorHelperMessages:
            own.checkErrorHelperMessages ??
            shared.checkErrorHelperMessages ??
            presets.errorHelperFunctions.length > 0,
    };
}

const STRING_ARRAY = { type: 'array', items: { type: 'string' } };

/** Option properties every rule accepts. */
export const SHARED_SCHEMA_PROPERTIES = {
    presets: STRING_ARRAY,
    ignoredComponents: STRING_ARRAY,
    replaceIgnoredComponents: STRING_ARRAY,
    ignoredFunctions: STRING_ARRAY,
    replaceIgnoredFunctions: STRING_ARRAY,
    ignoredFunctionPrefixes: STRING_ARRAY,
    replaceIgnoredFunctionPrefixes: STRING_ARRAY,
    ignorePatterns: STRING_ARRAY,
    translationFunctionNames: STRING_ARRAY,
};

/**
 * Builds a complete `meta.schema` array. oxlint aborts the whole run if a rule
 * receives options without one, so every rule must call this.
 *
 * @param {object} [extraProperties] rule-specific option properties
 */
export function sharedSchemaFor(extraProperties = {}) {
    return [
        {
            type: 'object',
            additionalProperties: false,
            properties: { ...SHARED_SCHEMA_PROPERTIES, ...extraProperties },
        },
    ];
}
