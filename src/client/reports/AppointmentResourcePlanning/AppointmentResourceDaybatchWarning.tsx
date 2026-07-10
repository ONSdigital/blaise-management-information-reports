import { Panel } from "blaise-design-system-react-components";
import React, { ReactElement } from "react";

function AppointmentResourceDaybatchWarning(): ReactElement {
    return (
        <Panel>
            <p>
                Run a Daybatch first to obtain the most accurate results.
            </p>
            <p>
                Appointments that have already been attempted will not be displayed.
            </p>
        </Panel>
    );
}

export default AppointmentResourceDaybatchWarning;
