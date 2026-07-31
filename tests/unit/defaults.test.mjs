import assert from 'node:assert/strict';
import test from 'node:test';

import {
    UNIVERSAL_ATTRIBUTES,
    UNIVERSAL_COMPONENTS,
    UNIVERSAL_FUNCTIONS,
    UNIVERSAL_FUNCTION_PREFIXES,
    UNIVERSAL_PATTERNS,
} from '../../src/lib/defaults.mjs';

test('ships the audited count of universal attributes', () => {
    assert.equal(UNIVERSAL_ATTRIBUTES.length, 131);
});

test('universal attributes contain no library-specific entries', () => {
    for (const libraryProp of ['dataKey', 'stackId', 'whileHover', 'className']) {
        assert.ok(
            !UNIVERSAL_ATTRIBUTES.includes(libraryProp),
            `${libraryProp} belongs to a preset, not the universal list`,
        );
    }
});

test('universal attributes include HTML, ARIA, and SVG entries', () => {
    for (const attr of ['href', 'ariaHidden', 'viewBox', 'strokeDasharray']) {
        assert.ok(UNIVERSAL_ATTRIBUTES.includes(attr), `missing ${attr}`);
    }
});

test('lists contain no duplicates', () => {
    for (const [name, list] of [
        ['attributes', UNIVERSAL_ATTRIBUTES],
        ['components', UNIVERSAL_COMPONENTS],
        ['functions', UNIVERSAL_FUNCTIONS],
        ['prefixes', UNIVERSAL_FUNCTION_PREFIXES],
    ]) {
        assert.equal(new Set(list).size, list.length, `${name} has duplicates`);
    }
});

test('patterns match machine-facing strings', () => {
    const matches = (value) => UNIVERSAL_PATTERNS.some((p) => p.test(value));

    for (const value of ['myRequests', 'de-DE', 'zh-Hans-CN', '#fff', '42', 'https://x.dev', '16px']) {
        assert.ok(matches(value), `expected ${value} to be ignorable`);
    }
});

test('patterns do not match user-visible copy', () => {
    const matches = (value) => UNIVERSAL_PATTERNS.some((p) => p.test(value));

    for (const value of ['Add Position', 'Something went wrong.', 'Increase value']) {
        assert.ok(!matches(value), `expected ${value} to be reported`);
    }
});

test('the errors. pattern is not universal, being a project convention', () => {
    const matches = (value) => UNIVERSAL_PATTERNS.some((p) => p.test(value));

    assert.ok(!matches('errors.somethingWentWrong'));
});
