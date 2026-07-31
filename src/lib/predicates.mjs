import { getAttributeName, getCalleeName, getJSXElementName } from './ast.mjs';

/** True when the string carries no copy worth translating. */
export function shouldIgnoreString(value, options) {
    if (!value || typeof value !== 'string') {
        return true;
    }

    const trimmed = value.trim();

    if (!trimmed) {
        return true;
    }

    return options.ignorePatterns.some((pattern) => pattern.test(trimmed));
}

/** Walks up the parent chain until `predicate` matches or the tree ends. */
export function hasAncestor(node, predicate) {
    let current = node?.parent;

    while (current) {
        if (predicate(current)) {
            return true;
        }

        current = current.parent;
    }

    return false;
}

const JSX_CONTEXT_TYPES = new Set([
    'JSXElement',
    'JSXFragment',
    'JSXExpressionContainer',
    'JSXAttribute',
]);

const FUNCTION_BOUNDARY_TYPES = new Set([
    'FunctionDeclaration',
    'FunctionExpression',
    'ArrowFunctionExpression',
]);

export function isInJSXContext(node) {
    // Bounded walk: a literal buried in a nested callback (an onClick handler,
    // a .then(), etc.) is imperative code, not visible JSX content, even
    // though that callback is itself the value of some JSXAttribute further
    // up. Stop looking as soon as we leave the current function scope without
    // having found a JSX ancestor first. Genuine JSX text/expressions are
    // always found before any function boundary, since JSX elements don't
    // introduce one.
    let current = node.parent;

    while (current) {
        if (JSX_CONTEXT_TYPES.has(current.type)) {
            return true;
        }

        if (FUNCTION_BOUNDARY_TYPES.has(current.type)) {
            return false;
        }

        current = current.parent;
    }

    return false;
}

/**
 * True when the node is part of a JSX attribute's value.
 *
 * Bounded like `isInJSXContext`: a literal inside a callback passed to an
 * attribute (`onClick={() => alert('hi')}`) is imperative code, not an
 * attribute value, even though a JSXAttribute sits above it.
 *
 * This is the line that divides `no-literal-string` from
 * `no-literal-jsx-attribute` — the string rule skips what this claims, so
 * every literal is reported by exactly one of them.
 */
export function isInJSXAttributeValue(node) {
    let current = node.parent;

    while (current) {
        if (current.type === 'JSXAttribute') {
            return true;
        }

        if (FUNCTION_BOUNDARY_TYPES.has(current.type)) {
            return false;
        }

        current = current.parent;
    }

    return false;
}

const CLASS_NAME_ATTRIBUTE_PATTERN = /classname$/i;

export function isInsideIgnoredAttribute(node, options) {
    return hasAncestor(node, (current) => {
        if (current.type !== 'JSXAttribute') {
            return false;
        }

        const attrName = getAttributeName(current);

        return Boolean(
            attrName &&
            (options.ignoredAttributes.has(attrName) ||
                attrName.startsWith('data-') ||
                CLASS_NAME_ATTRIBUTE_PATTERN.test(attrName)),
        );
    });
}

export function isInsideIgnoredComponent(node, options) {
    return hasAncestor(node, (current) => {
        if (current.type !== 'JSXElement') {
            return false;
        }

        const name = getJSXElementName(current);

        return Boolean(name && options.ignoredComponents.has(name));
    });
}

export function isIgnoredFunctionCall(calleeName, options, aliasTracker) {
    if (!calleeName) {
        return false;
    }

    return (
        options.ignoredFunctions.has(calleeName) ||
        aliasTracker.isTranslationCall(calleeName) ||
        options.ignoredFunctionPrefixes.some((prefix) =>
            calleeName.startsWith(prefix),
        )
    );
}

export function isInsideIgnoredCall(node, options, aliasTracker) {
    return hasAncestor(
        node,
        (current) =>
            current.type === 'CallExpression' &&
            isIgnoredFunctionCall(getCalleeName(current), options, aliasTracker),
    );
}

export function isInTypeContext(node) {
    return hasAncestor(node, (current) =>
        [
            'TSTypeAnnotation',
            'TSTypeAliasDeclaration',
            'TSInterfaceDeclaration',
            'TSLiteralType',
            'TSEnumDeclaration',
            'TSEnumMember',
            'TSModuleDeclaration',
        ].includes(current.type),
    );
}

export function isInImportExport(node) {
    // Only the module specifier of an import/export statement itself, e.g.
    // `import x from "./foo"` or `export * from "./foo"`. Walking the full
    // ancestor chain here (like the other isIn*/isInside* helpers do) would
    // match every string literal in the body of any `export function Foo()`
    // or `export const Foo = () => {}` component, since the whole
    // declaration is wrapped in an ExportNamedDeclaration/ExportDefaultDeclaration node.
    const parent = node.parent;

    if (!parent) {
        return false;
    }

    if (
        (parent.type === 'ImportDeclaration' ||
            parent.type === 'ImportExpression' ||
            parent.type === 'ExportNamedDeclaration' ||
            parent.type === 'ExportAllDeclaration') &&
        parent.source === node
    ) {
        return true;
    }

    return (
        parent.type === 'ExportDefaultDeclaration' &&
        parent.declaration === node
    );
}

export function isObjectPropertyKey(node) {
    const parent = node.parent;

    return Boolean(parent && parent.type === 'Property' && parent.key === node);
}

export function isComputedMemberKey(node) {
    // The key half of `errors[\`form_data.${field.name}\`]` or `map['someKey']`.
    // These address a data structure; they are never rendered.
    const parent = node.parent;

    return Boolean(
        parent &&
        parent.type === 'MemberExpression' &&
        parent.computed &&
        parent.property === node,
    );
}

export function isInElysiaDetailObject(node) {
    return hasAncestor(node, (current) => {
        if (current.type !== 'Property') {
            return false;
        }

        const key = current.key;

        if (
            !key ||
            key.type !== 'Identifier' ||
            !['summary', 'description'].includes(key.name)
        ) {
            return false;
        }

        const objectParent = current.parent;
        const propertyParent = objectParent?.parent;

        return Boolean(
            objectParent?.type === 'ObjectExpression' &&
            propertyParent?.type === 'Property' &&
            propertyParent.key?.type === 'Identifier' &&
            propertyParent.key.name === 'detail',
        );
    });
}

export function isErrorHelperMessage(node, options) {
    const parent = node.parent;

    if (!parent || parent.type !== 'CallExpression') {
        return false;
    }

    const calleeName = getCalleeName(parent);

    if (!calleeName || !options.errorHelperFunctions.has(calleeName)) {
        return false;
    }

    return parent.arguments?.[1] === node;
}
