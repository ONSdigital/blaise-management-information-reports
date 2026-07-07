import React, { ReactElement, useEffect } from "react";
import { ONSPanel } from "blaise-design-system-react-components";

interface Props {
    error: boolean;
}

function ReportErrorPanel({ error }: Props): ReactElement {
    let errorFocus: HTMLDivElement | null = null;

    useEffect(() => {
        errorFocus?.focus();
    }, [error, errorFocus]);

    if (error) {
        return (
            <div role="alert" ref={(input) => { errorFocus = input; }} tabIndex={-1}>
                <ONSPanel status="error">
                    <h2>Failed to run the report</h2>
                    <p>Try again later.</p>
                    <p>If you are still experiencing problems <a href="https://ons.service-now.com/">report this
                        issue</a> to Service Desk</p>
                </ONSPanel>
            </div>
        );
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return (<></>);
}

export default ReportErrorPanel;
