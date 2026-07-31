import assert from 'node:assert/strict';
import test from 'node:test';

import plugin from '../../src/index.mjs';

test('exports a plugin object with the i18n-literal namespace', () => {
    assert.equal(plugin.meta.name, 'i18n-literal');
});

test('exposes the three rules', () => {
    assert.deepEqual(Object.keys(plugin.rules).sort(), [
        'no-literal-jsx-attribute',
        'no-literal-string',
        'no-literal-template',
    ]);
});

test('every rule declares a schema, because oxlint aborts without one', () => {
    for (const [name, rule] of Object.entries(plugin.rules)) {
        assert.ok(
            Array.isArray(rule.meta?.schema),
            `${name} must declare meta.schema as an array`,
        );
    }
});

test('recommended config enables all three rules at warn', () => {
    assert.deepEqual(plugin.configs.recommended.rules, {
        'i18n-literal/no-literal-string': 'warn',
        'i18n-literal/no-literal-jsx-attribute': 'warn',
        'i18n-literal/no-literal-template': 'warn',
    });
});
