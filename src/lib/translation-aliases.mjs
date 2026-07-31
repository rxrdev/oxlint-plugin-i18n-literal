import { getCalleeName } from './ast.mjs';

/**
 * Tracks `useTranslation` aliases for a single file.
 *
 * Picks up `const { t: tCommon } = useTranslation('common')`, a pattern used
 * when a component needs a translator for a second namespace alongside its own
 * default `t`. Without this, calls through the alias look like plain literals.
 *
 * One tracker per rule invocation — the Set must not outlive the file, or an
 * alias found in one file silently whitelists that identifier everywhere else.
 *
 * @param {{translationFunctionNames: Set<string>}} options
 */
export function createAliasTracker(options) {
    const names = new Set(options.translationFunctionNames);

    return {
        /** @param {object} node a VariableDeclarator */
        register(node) {
            if (node.init?.type !== 'CallExpression') {
                return;
            }

            if (getCalleeName(node.init) !== 'useTranslation') {
                return;
            }

            if (node.id?.type !== 'ObjectPattern') {
                return;
            }

            for (const property of node.id.properties) {
                if (
                    property.type === 'Property' &&
                    property.key?.type === 'Identifier' &&
                    property.key.name === 't' &&
                    property.value?.type === 'Identifier'
                ) {
                    names.add(property.value.name);
                }
            }
        },

        /** @param {string|null} calleeName */
        isTranslationCall(calleeName) {
            return Boolean(calleeName) && names.has(calleeName);
        },
    };
}
