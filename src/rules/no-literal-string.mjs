import { resolveOptions, sharedSchemaFor } from '../lib/options.mjs';
import {
    isComputedMemberKey,
    isInElysiaDetailObject,
    isErrorHelperMessage,
    isInImportExport,
    isInJSXAttributeValue,
    isInJSXContext,
    isInTypeContext,
    isInsideIgnoredCall,
    isInsideIgnoredComponent,
    isObjectPropertyKey,
    shouldIgnoreString,
} from '../lib/predicates.mjs';
import { createAliasTracker } from '../lib/translation-aliases.mjs';

/** Truncates reported text so diagnostics stay readable. */
function preview(text) {
    const trimmed = String(text).trim();

    return trimmed.slice(0, 50) + (trimmed.length > 50 ? '...' : '');
}

export default {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Disallow untranslated string literals in user-visible JSX text',
            category: 'i18n',
        },
        schema: sharedSchemaFor({
            checkElysiaRouteDetails: { type: 'boolean' },
            checkErrorHelperMessages: { type: 'boolean' },
            errorHelperFunctions: { type: 'array', items: { type: 'string' } },
            replaceErrorHelperFunctions: {
                type: 'array',
                items: { type: 'string' },
            },
        }),
        messages: {
            default:
                'Untranslated string "{{text}}". Use your i18n translation function for user-visible text.',
        },
    },

    create(context) {
        const options = resolveOptions(context);
        const aliases = createAliasTracker(options);

        return {
            VariableDeclarator(node) {
                aliases.register(node);
            },

            JSXText(node) {
                if (shouldIgnoreString(node.value, options)) {
                    return;
                }

                if (isInsideIgnoredComponent(node, options)) {
                    return;
                }

                context.report({
                    node,
                    messageId: 'default',
                    data: { text: preview(node.value) },
                });
            },

            Literal(node) {
                if (typeof node.value !== 'string') {
                    return;
                }

                const isApiContext =
                    (options.checkElysiaRouteDetails &&
                        isInElysiaDetailObject(node)) ||
                    (options.checkErrorHelperMessages &&
                        isErrorHelperMessage(node, options));

                if (!isApiContext) {
                    if (!isInJSXContext(node)) {
                        return;
                    }

                    // Attribute values belong to no-literal-jsx-attribute,
                    // which is the rule that knows the ignoredAttributes list.
                    // Without this the two rules double-report every attribute.
                    if (isInJSXAttributeValue(node)) {
                        return;
                    }

                    if (isInsideIgnoredComponent(node, options)) {
                        return;
                    }

                    if (isObjectPropertyKey(node) || isComputedMemberKey(node)) {
                        return;
                    }
                }

                if (isInTypeContext(node) || isInImportExport(node)) {
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
