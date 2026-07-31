import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import test from 'node:test';

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');

/**
 * Runs oxlint over one fixture directory and returns this plugin's diagnostics.
 *
 * @returns {Array<{file: string, line: number, text: string}>}
 */
function lint(presetDir) {
    const cwd = join(fixturesDir, presetDir);
    let stdout = '';

    try {
        stdout = execFileSync(
            'npx',
            ['oxlint', '-c', '.oxlintrc.json', '--format=unix', '.'],
            { cwd, encoding: 'utf8', stdio: 'pipe' },
        );
    } catch (error) {
        // oxlint exits non-zero when it reports problems, which is the
        // expected path for any flagged fixture.
        stdout = error.stdout ?? '';

        if (!stdout) {
            throw error;
        }
    }

    return stdout
        .split('\n')
        .filter((line) => line.includes('i18n-literal'))
        .map((line) => {
            const match = line.match(
                /^(.*?):(\d+):\d+: Untranslated (?:string|template literal) "(.*?)"[.\s]/,
            );

            return match
                ? { file: match[1], line: Number(match[2]), text: match[3] }
                : null;
        })
        .filter(Boolean);
}

/**
 * Collects `expect-warning:` annotations from a fixture file.
 *
 * The annotation must sit in a comment that closes on the same line — either
 * `{/* expect-warning: x *␘/}` or `// expect-warning: x`. Anchoring on the
 * terminator matters: a looser pattern also matches the prose in each
 * fixture's own docblock, which mentions `expect-warning` while explaining it.
 */
function expectations(presetDir, filename) {
    const source = readFileSync(join(fixturesDir, presetDir, filename), 'utf8');

    return source
        .split('\n')
        .map((line) =>
            line.match(/(?:\/\/|\/\*)\s*expect-warning:\s*(.+?)\s*(?:\*\/\s*\}?)?\s*$/),
        )
        .filter(Boolean)
        .map((match) => match[1]);
}

const presetDirs = readdirSync(fixturesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

for (const presetDir of presetDirs) {
    const files = readdirSync(join(fixturesDir, presetDir));
    const diagnostics = lint(presetDir);

    if (files.some((f) => f.startsWith('allowed'))) {
        test(`${presetDir}: allowed fixture produces no warnings`, () => {
            const unexpected = diagnostics
                .filter((d) => d.file.includes('allowed'))
                .map((d) => `${d.line}: ${d.text}`);

            assert.deepEqual(unexpected, []);
        });
    }

    const flaggedFile = files.find((f) => f.startsWith('flagged'));

    if (flaggedFile) {
        test(`${presetDir}: every expected warning is reported`, () => {
            const expected = expectations(presetDir, flaggedFile);
            const reported = diagnostics.filter((d) => d.file.includes('flagged'));

            assert.ok(expected.length > 0, 'fixture must declare expectations');

            for (const text of expected) {
                assert.ok(
                    reported.some((d) => d.text === text),
                    `expected a warning for "${text}"`,
                );
            }

            assert.equal(
                reported.length,
                expected.length,
                `expected ${expected.length} warnings, got ${reported.length}: ${reported.map((d) => `${d.line}:${d.text}`).join(', ')}`,
            );
        });
    }
}
