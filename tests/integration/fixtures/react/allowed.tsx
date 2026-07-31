/**
 * Every literal in this file is machine-facing: SVG geometry, identifiers,
 * locale tags, and data-structure lookups. The rules must stay silent across
 * the whole file, so any warning reported here is a regression.
 */
import { useTranslation } from 'react-i18next';

type Props = {
    errors: Record<string, string>;
    field: { name: string };
    loadingAction: string;
};

export function Allowed({ errors, field, loadingAction }: Props) {
    const { t } = useTranslation('common');
    const { t: tShared } = useTranslation('shared');

    return (
        <div className="flex gap-2" data-testid="allowed">
            {/* SVG presentation attributes */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M12 8v4l3 3" />
                <circle cx="12" cy="12" r="9" />
            </svg>

            {/* camelCase identifiers naming props, not copy */}
            <DataTable
                reloadOnly={['teamRequests', 'queryParams']}
                data={['myRequests', 'statusOptions', 'avgProcessingDays']}
            />

            {/* BCP-47 locale tags */}
            <span>{formatDayAbbr(new Date(), 'de-DE')}</span>
            <span>{formatDayAbbr(new Date(), 'pt-BR')}</span>
            <span>{formatDayAbbr(new Date(), 'zh-Hans-CN')}</span>

            {/* Computed member keys address data, they are never rendered */}
            <Field
                error={errors[`form_data.${field.name}`]}
                hint={errors['form_data.amount']}
            />

            {/* State comparison against an action identifier */}
            {loadingAction === 'markPaid' ? <Spinner /> : null}

            {/* Translated text, including through a namespaced alias */}
            <p>{t('stages.completed')}</p>
            <p>{tShared('app.name')}</p>

            {/* Ignored attributes */}
            <a href="/requests" target="_blank" rel="noreferrer" role="link">
                {t('actions.view')}
            </a>
        </div>
    );
}
