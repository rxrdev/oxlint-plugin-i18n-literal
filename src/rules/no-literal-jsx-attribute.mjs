import { resolveOptions, sharedSchemaFor } from '../lib/options.mjs';
import {
    hasAncestor,
    isInTypeContext,
    isInsideIgnoredAttribute,
    isInsideIgnoredCall,
    isInsideIgnoredComponent,
    shouldIgnoreString,
} from '../lib/predicates.mjs';
import { createAliasTracker } from '../lib/translation-aliases.mjs';

function preview(text) {
    const trimmed = String(text).trim();

    return trimmed.slice(0, 50) + (trimmed.length > 50 ? '...' : '');
}

/** True when the literal sits inside a JSXAttribute value. */
function isInJSXAttribute(node) {
    return hasAncestor(node, (current) => current.type === 'JSXAttribute');
}

export default {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Disallow untranslated string literals in JSX attribute values',
            category: 'i18n',
        },
        schema: sharedSchemaFor({
            ignoredAttributes: { type: 'array', items: { type: 'string' } },
            replaceIgnoredAttributes: {
                type: 'array',
                items: { type: 'string' },
            },
        }),
        messages: {
            default:
                'Untranslated string "{{text}}" in a JSX attribute. Use your i18n translation function for user-visible text.',
        },
    },

    create(context) {
        const options = resolveOptions(context);
        const aliases = createAliasTracker(options);

        return {
            VariableDeclarator(node) {
                aliases.register(node);
            },

            Literal(node) {
                if (typeof node.value !== 'string') {
                    return;
                }

                if (!isInJSXAttribute(node)) {
                    return;
                }

                if (isInsideIgnoredAttribute(node, options)) {
                    return;
                }

                if (isInsideIgnoredComponent(node, options)) {
                    return;
                }

                if (isInTypeContext(node)) {
                    return;
                }

                if (isInsideIgnoredCall(node, options, aliases)) {
                    return;
                }

                if (shouldIgnoreString(node.value, options)) {
                    return;
                }

                context.report({
                    node,
                    messageId: 'default',
                    data: { text: preview(node.value) },
                });
            },
        };
    },
};
