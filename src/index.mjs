/**
 * oxlint plugin: i18n-literal
 *
 * Flags user-visible string literals in JSX that should be routed through an
 * i18n translation function. Three rules split by syntax position; shared
 * configuration lives in `settings['i18n-literal']`.
 */

import noLiteralJsxAttribute from './rules/no-literal-jsx-attribute.mjs';
import noLiteralString from './rules/no-literal-string.mjs';
import noLiteralTemplate from './rules/no-literal-template.mjs';

const plugin = {
    meta: {
        name: 'i18n-literal',
        version: '0.1.0',
    },
    rules: {
        'no-literal-string': noLiteralString,
        'no-literal-jsx-attribute': noLiteralJsxAttribute,
        'no-literal-template': noLiteralTemplate,
    },
    configs: {
        recommended: {
            rules: {
                'i18n-literal/no-literal-string': 'warn',
                'i18n-literal/no-literal-jsx-attribute': 'warn',
                'i18n-literal/no-literal-template': 'warn',
            },
        },
    },
};

export default plugin;
