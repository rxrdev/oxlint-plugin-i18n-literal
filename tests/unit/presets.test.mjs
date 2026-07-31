import assert from 'node:assert/strict';
import test from 'node:test';

import { PRESETS } from '../../src/lib/presets/index.mjs';

test('exposes the three shipped presets', () => {
    assert.deepEqual(Object.keys(PRESETS).sort(), ['elysia', 'react', 'recharts']);
});

test('react preset carries JSX and motion attributes', () => {
    assert.equal(PRESETS.react.attributes.length, 21);
    for (const attr of ['className', 'key', 'ref', 'htmlFor', 'whileHover', 'layoutId']) {
        assert.ok(PRESETS.react.attributes.includes(attr), `missing ${attr}`);
    }
});

test('recharts preset carries chart data-binding props', () => {
    assert.equal(PRESETS.recharts.attributes.length, 10);
    for (const attr of ['dataKey', 'stackId', 'xAxisId', 'tickFormatter']) {
        assert.ok(PRESETS.recharts.attributes.includes(attr), `missing ${attr}`);
    }
});

test('elysia preset enables route-detail checking with configurable helpers', () => {
    assert.equal(PRESETS.elysia.checkElysiaRouteDetails, true);
    assert.ok(PRESETS.elysia.errorHelperFunctions.includes('notFound'));
});

test('presets do not overlap each other on attributes', () => {
    const react = new Set(PRESETS.react.attributes);

    for (const attr of PRESETS.recharts.attributes) {
        assert.ok(!react.has(attr), `${attr} is in both react and recharts`);
    }
});
