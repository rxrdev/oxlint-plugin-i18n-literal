/**
 * Recharts data-binding props name fields on the chart's data rows. With the
 * recharts preset enabled, none of these may be reported.
 */
export function Charts() {
    return (
        <div>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <Area dataKey="formattedValue" type="monotone" stackId="a" />
            <XAxis dataKey="label" orientation="bottom" />
            <YAxis yAxisId="left" domain={[0, 100]} />
        </div>
    );
}
