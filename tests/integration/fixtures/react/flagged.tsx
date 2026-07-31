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
};

export function Flagged({ title, placeholder, role, theme }: Props) {
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
        </div>
    );
}
