import assert from 'node:assert/strict';
import test from 'node:test';

import { createAliasTracker } from '../../src/lib/translation-aliases.mjs';
import { resolveOptions } from '../../src/lib/options.mjs';
import { shouldIgnoreString, isComputedMemberKey } from '../../src/lib/predicates.mjs';

const options = resolveOptions({ settings: {}, options: [] });

test('ignores blank and machine-facing strings', () => {
    for (const value of ['', '   ', 'myRequests', 'de-DE', '#fff']) {
        assert.ok(shouldIgnoreString(value, options), `expected ${value} ignored`);
    }
});

test('does not ignore user-visible copy', () => {
    for (const value of ['Add Position', 'Something went wrong.']) {
        assert.ok(!shouldIgnoreString(value, options), `expected ${value} reported`);
    }
});

test('detects a computed member key', () => {
    const literal = { type: 'Literal', value: 'form_data.x' };
    literal.parent = {
        type: 'MemberExpression',
        computed: true,
        property: literal,
    };

    assert.ok(isComputedMemberKey(literal));
});

test('a non-computed member property is not a computed key', () => {
    const literal = { type: 'Literal', value: 'x' };
    literal.parent = {
        type: 'MemberExpression',
        computed: false,
        property: literal,
    };

    assert.ok(!isComputedMemberKey(literal));
});

test('alias tracker registers a destructured useTranslation alias', () => {
    const tracker = createAliasTracker(options);
    const declarator = {
        init: { type: 'CallExpression', callee: { type: 'Identifier', name: 'useTranslation' } },
        id: {
            type: 'ObjectPattern',
            properties: [
                {
                    type: 'Property',
                    key: { type: 'Identifier', name: 't' },
                    value: { type: 'Identifier', name: 'tCommon' },
                },
            ],
        },
    };

    assert.ok(!tracker.isTranslationCall('tCommon'));
    tracker.register(declarator);
    assert.ok(tracker.isTranslationCall('tCommon'));
});

test('alias trackers do not share state across files', () => {
    const first = createAliasTracker(options);
    const second = createAliasTracker(options);
    const declarator = {
        init: { type: 'CallExpression', callee: { type: 'Identifier', name: 'useTranslation' } },
        id: {
            type: 'ObjectPattern',
            properties: [
                {
                    type: 'Property',
                    key: { type: 'Identifier', name: 't' },
                    value: { type: 'Identifier', name: 'tLeaked' },
                },
            ],
        },
    };

    first.register(declarator);

    assert.ok(first.isTranslationCall('tLeaked'));
    assert.ok(
        !second.isTranslationCall('tLeaked'),
        'an alias from one file must not leak into another',
    );
});
