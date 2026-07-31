# @rrazvan.dev/oxlint-plugin-i18n-literal

Flags untranslated user-visible string literals in JSX, so copy that should go
through your i18n translation function doesn't ship hardcoded.

Three rules, split by syntax position:

| Rule | Reports |
| --- | --- |
| `no-literal-string` | JSX text (`<span>Add item</span>`) and string literals in JSX children |
| `no-literal-jsx-attribute` | String literals in attribute values (`title="Settings"`) |
| `no-literal-template` | Template literals in JSX (`` {`Waiting for ${name}`} ``) |

Every literal is claimed by exactly one rule, so enabling all three does not
double-report. Enable only the ones you want.

## Install

```bash
npm i -D @rrazvan.dev/oxlint-plugin-i18n-literal
```

Requires Node >= 22 and oxlint >= 1.70.

## Configure

The `oxlint-plugin-*` prefix is not auto-resolved by oxlint, so load the plugin
with the alias form. The `name` you choose is the namespace used in `rules`:

```json
{
    "jsPlugins": [
        {
            "name": "i18n-literal",
            "specifier": "@rrazvan.dev/oxlint-plugin-i18n-literal"
        }
    ],
    "settings": {
        "i18n-literal": {
            "presets": ["react"]
        }
    },
    "rules": {
        "i18n-literal/no-literal-string": "warn",
        "i18n-literal/no-literal-jsx-attribute": "warn",
        "i18n-literal/no-literal-template": "warn"
    }
}
```

Configuration goes in `settings["i18n-literal"]`, where all three rules share
it. Every option below can also be passed per-rule as the second element of a
rule entry, which overrides the shared value for that rule only.

## Ignoring things

The plugin ships defaults that cover the machine-facing strings common to any
codebase — HTML/ARIA/SVG attributes, `console.*` and test-framework calls,
hex colours, URLs, numbers, camelCase identifiers, BCP-47 locale tags. You
extend those defaults rather than restating them.

### Ignore patterns

`ignorePatterns` takes regex **source strings** (not `/slashes/`), tested
against the trimmed string. Remember that JSON needs the backslash escaped —
`\\.` in JSON is `\.` in the regex.

```json
{
    "settings": {
        "i18n-literal": {
            "presets": ["react", "recharts"],
            "ignorePatterns": ["^errors\\.[a-z0-9_.-]+$"]
        }
    }
}
```

That example ignores translation keys your code passes around as data, such as
`errors.form_data.amount`. Some other patterns worth knowing:

```json
{
    "ignorePatterns": [
        "^errors\\.[a-z0-9_.-]+$",
        "^[A-Z][A-Z0-9_]*$",
        "^@[a-z-]+/",
        "^\\d{4}-\\d{2}-\\d{2}$"
    ]
}
```

An invalid regex throws at lint time with the offending pattern named, rather
than silently matching nothing.

### Ignore by attribute, component, or function

```json
{
    "settings": {
        "i18n-literal": {
            "ignoredAttributes": ["testId", "trackingLabel"],
            "ignoredComponents": ["Icon", "CodeBlock"],
            "ignoredFunctions": ["analytics.track", "reportError"],
            "ignoredFunctionPrefixes": ["telemetry."]
        }
    }
}
```

- **`ignoredAttributes`** — attribute names whose values are never copy. Any
  attribute starting with `data-`, and anything ending in `className`, is
  ignored already.
- **`ignoredComponents`** — nothing inside these elements is reported. Useful
  for `<Trans>`-style components that handle their own translation.
- **`ignoredFunctions`** — literals anywhere inside a call to these are
  ignored. Dotted paths like `analytics.track` work.
- **`ignoredFunctionPrefixes`** — matches by prefix, so `telemetry.` covers
  `telemetry.event`, `telemetry.page`, and so on.

Each has a `replaceX` counterpart (`replaceIgnoredAttributes`,
`replaceIgnoredComponents`, `replaceIgnoredFunctions`,
`replaceIgnoredFunctionPrefixes`) that **discards the built-in defaults
entirely** rather than extending them. Reach for these only when a default is
actively wrong for you — you take on maintaining the whole list.

### Translation functions

`t`, `i18n.t`, and `i18next.t` are recognised by default. Aliases destructured
from `useTranslation` are picked up automatically per file, so this needs no
configuration:

```jsx
const { t: tCommon } = useTranslation('common');
// tCommon('app.name') is not reported
```

Add others if your codebase wraps them:

```json
{ "settings": { "i18n-literal": { "translationFunctionNames": ["translate", "$t"] } } }
```

## Presets

Presets layer library-specific knowledge on top of the universal defaults.
`presets` defaults to `["react"]`; naming any preset replaces that default, so
list every one you want. `"presets": []` opts out of all of them.

| Preset | Adds |
| --- | --- |
| `react` | `className`, `key`, `ref`, `htmlFor`, `defaultValue`, and Framer Motion props (`initial`, `animate`, `whileHover`, `layoutId`, …) |
| `recharts` | Chart data-binding props: `dataKey`, `nameKey`, `stackId`, `xAxisId`, `domain`, `tickFormatter`, … |
| `elysia` | Enables checking of server-side copy — see below |

```json
{ "settings": { "i18n-literal": { "presets": ["react", "recharts"] } } }
```

Naming an unknown preset throws and lists the valid names, rather than
silently ignoring the typo.

## Server-side copy (Elysia)

The `elysia` preset extends `no-literal-string` beyond JSX to two places where
[Elysia](https://elysiajs.com) apps keep user-facing text — OpenAPI route
details, and the message argument of error helpers:

```typescript
app.get('/users', handler, {
    detail: { summary: 'List all users' },  // reported
});

throw notFound('USER_MISSING', 'No such user');  // reported
```

Default helper names are `badRequest`, `unauthorized`, `forbidden`,
`notFound`, `conflict`, `tooManyRequests`, and `internalError`. Override with
`errorHelperFunctions` (extends) or `replaceErrorHelperFunctions` (replaces),
and turn either behaviour off independently:

```json
{
    "rules": {
        "i18n-literal/no-literal-string": ["warn", {
            "errorHelperFunctions": ["paymentRequired"],
            "checkElysiaRouteDetails": true,
            "checkErrorHelperMessages": false
        }]
    }
}
```

Both checks are off unless the `elysia` preset is enabled or you set them
explicitly.

## Per-rule options

Some options only make sense for certain rules:

| Option | Rules |
| --- | --- |
| `ignoredAttributes`, `replaceIgnoredAttributes` | `no-literal-jsx-attribute`, `no-literal-template` |
| `errorHelperFunctions`, `replaceErrorHelperFunctions`, `checkElysiaRouteDetails`, `checkErrorHelperMessages` | `no-literal-string` |

```json
{
    "rules": {
        "i18n-literal/no-literal-jsx-attribute": ["warn", {
            "ignoredAttributes": ["tooltipId"]
        }]
    }
}
```

## What is not reported

Beyond the ignore lists, these are excluded structurally:

- Import and export module specifiers
- TypeScript type positions — annotations, literal types, enums, interfaces
- Object property keys and computed member keys (`errors['form_data.amount']`)
- Literals inside callbacks passed to JSX attributes, such as
  `onClick={() => alert('hi')}` — imperative code, not rendered copy
- Template literals whose static parts carry no words (`` `${a}${b}` ``)

## Licence

MIT
