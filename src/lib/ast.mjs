/**
 * Node-shape helpers. Each resolves a name from an AST node, returning `null`
 * when the node shape is one this plugin has no name for.
 */

/** @returns {string|null} e.g. `div`, `Card`, or `Card.Header` */
export function getJSXElementName(node) {
    const name = node?.openingElement?.name || node?.name;

    if (!name) {
        return null;
    }

    if (name.type === 'JSXIdentifier') {
        return name.name;
    }

    if (name.type === 'JSXMemberExpression') {
        const parts = [];
        let current = name;

        while (current?.type === 'JSXMemberExpression') {
            parts.unshift(current.property.name);
            current = current.object;
        }

        if (current?.type === 'JSXIdentifier') {
            parts.unshift(current.name);
        }

        return parts.join('.');
    }

    return null;
}

/** @returns {string|null} e.g. `className` or `xlink:href` */
export function getAttributeName(node) {
    if (!node?.name) {
        return null;
    }

    if (node.name.type === 'JSXIdentifier') {
        return node.name.name;
    }

    if (node.name.type === 'JSXNamespacedName') {
        return `${node.name.namespace.name}:${node.name.name.name}`;
    }

    return null;
}

/** @returns {string|null} e.g. `t`, `i18n.t`, or `console.log` */
export function getCalleeName(node) {
    const callee = node?.callee;

    if (!callee) {
        return null;
    }

    if (callee.type === 'Identifier') {
        return callee.name;
    }

    if (callee.type === 'MemberExpression') {
        const parts = [];
        let current = callee;

        while (current?.type === 'MemberExpression') {
            if (current.property.type === 'Identifier') {
                parts.unshift(current.property.name);
            }

            if (current.property.type === 'Literal') {
                parts.unshift(String(current.property.value));
            }

            current = current.object;
        }

        if (current?.type === 'Identifier') {
            parts.unshift(current.name);
        }

        return parts.join('.');
    }

    return null;
}
