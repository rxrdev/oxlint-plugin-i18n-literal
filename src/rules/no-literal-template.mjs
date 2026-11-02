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

                // Judge the cooked text, the string users actually see, so an
                // escape like a non-breaking space is not mistaken for words.
                // Cooked is null only for an invalid escape in a tagged
                // template, hence the raw fallback.
                const judged = node.quasis
                    .map((quasi) => quasi.value.cooked ?? quasi.value.raw)
                    .join('${...}');

                // The display form: the raw source spelling with expressions
                // elided, so the diagnostic shows what the user typed and its
                // shape rather than a half-quoted fragment.
                const rendered = node.quasis
                    .map((quasi) => quasi.value.raw)
                    .join('${...}');

                if (shouldIgnoreString(judged, options)) {
                    return;
                }

                // Only report when a static chunk carries real words; a literal
                // that is purely interpolation (`${a}${b}`) has no copy to
                // translate.
                const hasText = node.quasis.some((quasi) => {
                    const text = quasi.value.cooked ?? quasi.value.raw ?? '';

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
