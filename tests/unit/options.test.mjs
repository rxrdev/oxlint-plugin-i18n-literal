import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveOptions } from '../../src/lib/options.mjs';

/** Builds a fake oxlint rule context. */
const ctx = ({ settings = {}, options = [] } = {}) => ({ settings, options });

test('defaults to the react preset when none is named', () => {
    const resolved = resolveOptions(ctx());

    assert.ok(resolved.ignoredAttributes.has('className'));
    assert.ok(resolved.ignoredAttributes.has('href'));
});

test('does not enable recharts or elysia by default', () => {
    const resolved = resolveOptions(ctx());

    assert.ok(!resolved.ignoredAttributes.has('dataKey'));
    assert.equal(resolved.checkElysiaRouteDetails, false);
});

test('composes named presets additively onto universal defaults', () => {
    const resolved = resolveOptions(
        ctx({ settings: { 'i18n-literal': { presets: ['react', 'recharts'] } } }),
    );

    assert.ok(resolved.ignoredAttributes.has('viewBox'));
    assert.ok(resolved.ignoredAttributes.has('className'));
    assert.ok(resolved.ignoredAttributes.has('dataKey'));
});

test('an empty presets array yields universal defaults only', () => {
    const resolved = resolveOptions(
        ctx({ settings: { 'i18n-literal': { presets: [] } } }),
    );

    assert.ok(resolved.ignoredAttributes.has('href'));
    assert.ok(!resolved.ignoredAttributes.has('className'));
});

test('elysia preset turns on route-detail checking', () => {
    const resolved = resolveOptions(
        ctx({ settings: { 'i18n-literal': { presets: ['elysia'] } } }),
    );

    assert.equal(resolved.checkElysiaRouteDetails, true);
    assert.ok(resolved.errorHelperFunctions.has('notFound'));
});

test('shared settings merge with per-rule options', () => {
    const resolved = resolveOptions(
        ctx({
            settings: { 'i18n-literal': { ignoredComponents: ['Shared'] } },
            options: [{ ignoredAttributes: ['perRule'] }],
        }),
    );

    assert.ok(resolved.ignoredComponents.has('Shared'));
    assert.ok(resolved.ignoredAttributes.has('perRule'));
});

test('replaceX options discard defaults entirely', () => {
    const resolved = resolveOptions(
        ctx({ options: [{ replaceIgnoredAttributes: ['only'] }] }),
    );

    assert.deepEqual([...resolved.ignoredAttributes], ['only']);
});

test('string ignorePatterns compile to regexes', () => {
    const resolved = resolveOptions(
        ctx({ settings: { 'i18n-literal': { ignorePatterns: ['^errors\\.'] } } }),
    );

    assert.ok(resolved.ignorePatterns.some((p) => p.test('errors.generic')));
});

test('an invalid ignorePatterns regex throws a named error', () => {
    assert.throws(
        () => resolveOptions(ctx({ options: [{ ignorePatterns: ['('] }] })),
        /invalid ignorePatterns regex/,
    );
});

test('an unknown preset name throws rather than failing silently', () => {
    assert.throws(
        () => resolveOptions(ctx({ settings: { 'i18n-literal': { presets: ['nope'] } } })),
        /unknown preset "nope"/,
    );
});

test('translation function names always include the t defaults', () => {
    const resolved = resolveOptions(ctx());

    assert.ok(resolved.translationFunctionNames.has('t'));
    assert.ok(resolved.translationFunctionNames.has('i18n.t'));
});
