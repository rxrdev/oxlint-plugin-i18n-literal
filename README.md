# @rrazvan.dev/oxlint-plugin-i18n-literal

Flags untranslated user-visible string literals in JSX.

## Install

```bash
npm i -D @rrazvan.dev/oxlint-plugin-i18n-literal
```

## Configure

The `oxlint-plugin-*` prefix is not auto-resolved by oxlint, so load the plugin
with the alias form:

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
