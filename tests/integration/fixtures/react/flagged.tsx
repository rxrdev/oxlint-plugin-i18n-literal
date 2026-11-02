/**
 * Every literal in this file is user-visible copy that should be translated.
 * The rules must report each one, so a missing warning here is a regression.
 * Each expectation is declared inline with an `expect-warning:` comment naming
 * the text the rules should surface.
 */
type Props = {
    title?: string;
    placeholder?: string;
    role: string;
    theme: string;
    name: string;
    total: string;
};

export function Flagged({
    title,
    placeholder,
    role,
    theme,
    name,
    total,
}: Props) {
    return (
        <div>
            {/* expect-warning: Settings */}
            <Heading title="Settings" />

            {/* expect-warning: Manage your profile and account settings */}
            <Heading description="Manage your profile and account settings" />

            {/* expect-warning: Something went wrong. */}
            <AlertTitle>{title ?? 'Something went wrong.'}</AlertTitle>

            {/* expect-warning: Select an option */}
            <SelectValue placeholder={placeholder ?? 'Select an option'} />

            {/* expect-warning: Password */}
            <Input type="password" placeholder="Password" />

            {/* expect-warning: App Logo */}
            <img src="/logo.svg" alt="App Logo" />

            {/* expect-warning: PDF Preview */}
            <iframe src="/doc.pdf" title="PDF Preview" />

            {/* expect-warning: Increase value */}
            <button aria-label="Increase value" type="button" />

            {/* expect-warning: Add Position */}
            <span>Add Position</span>

            {/* expect-warning: Waiting for ${...} */}
            <span>{`Waiting for ${role}`}</span>

            {/* expect-warning: Toggle ${...} theme */}
            <span className="sr-only">{`Toggle ${theme} theme`}</span>

            {/* expect-warning: Hallo ${...} */}
            <p>{`Hallo ${name}`}</p>

            {/* expect-warning: Gesamt:\u00a0${...} */}
            <p>{`Gesamt:\u00a0${total}`}</p>

            {/* expect-warning: \u0048allo ${...} */}
            <p>{`\u0048allo ${name}`}</p>

            {/* expect-warning: \unicode ${...} */}
            <p>{String.raw`\unicode ${name}`}</p>
        </div>
    );
}
