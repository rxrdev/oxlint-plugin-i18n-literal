import { resolveOptions, sharedSchemaFor } from '../lib/options.mjs';
import {
    isComputedMemberKey,
    isInJSXContext,
    isInTypeContext,
    isInsideIgnoredAttribute,
    isInsideIgnoredCall,
    isInsideIgnoredComponent,
    shouldIgnoreString,
} from '../lib/predicates.mjs';
import { createAliasTracker } from '../lib/translation-aliases.mjs';

export default {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Disallow untranslated template literals in user-visible JSX',
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
                'Untranslated template literal "{{text}}". Use your i18n translation function with interpolation values.',
        },
    },

    create(context) {
        const options = resolveOptions(context);
        const aliases = createAliasTracker(options);

        return {
            VariableDeclarator(node) {
                aliases.register(node);
            },

            TemplateLiteral(node) {
                if (!isInJSXContext(node)) {
                    return;
                }

                if (isInTypeContext(node)) {
                    return;
                }

                if (isComputedMemberKey(node)) {
                    return;
                }

                if (isInsideIgnoredAttribute(node, options)) {
                    return;
                }

                if (isInsideIgnoredComponent(node, options)) {
                    return;
                }

                if (isInsideIgnoredCall(node, options, aliases)) {
                    return;
                }

                // Render the literal with its expressions elided, so the
                // diagnostic shows shape rather than a half-quoted fragment.
                const rendered = node.quasis
                    .map((quasi) => quasi.value.raw)
                    .join('${...}');

                if (shouldIgnoreString(rendered, options)) {
                    return;
                }

                // Only report when a static chunk carries real words; a literal
                // that is purely interpolation (`${a}${b}`) has no copy to
                // translate.
                const hasText = node.quasis.some((quasi) => {
                    const text = quasi.value.raw || quasi.value.cooked || '';

                    return text.trim() && !shouldIgnoreString(text, options);
                });

                if (!hasText) {
                    return;
                }

                const trimmed = rendered.trim();

                context.report({
                    node,
                    messageId: 'default',
                    data: {
                        text:
                            trimmed.slice(0, 50) +
                            (trimmed.length > 50 ? '...' : ''),
                    },
                });
            },
        };
    },
};
