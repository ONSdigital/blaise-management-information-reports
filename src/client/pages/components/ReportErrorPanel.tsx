import { Panel } from "blaise-design-system-react-components";
import React, { type ReactElement, useEffect } from "react";

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
      <div
        role="alert"
        ref={(input) => {
          errorFocus = input;
        }}
        tabIndex={-1}
      >
        <Panel status="error">
          <h2>Failed to run the report</h2>
          <p>Try again later.</p>
          <p>
            If you are still experiencing problems{" "}
            <a href="https://ons.service-now.com/">report this issue</a> to Service Desk
          </p>
        </Panel>
      </div>
    );
  }

  return <></>;
}

export default ReportErrorPanel;
