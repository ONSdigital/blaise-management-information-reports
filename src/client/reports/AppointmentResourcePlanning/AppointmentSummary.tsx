import { Panel } from "blaise-design-system-react-components";
import React, { type ReactElement } from "react";

import { type AppointmentResourcePlanningSummaryReportData } from "../../types/interfaces";

interface Props {
    data: AppointmentResourcePlanningSummaryReportData[];
    failed: boolean;
}

function AppointmentSummary({ data, failed }: Props): ReactElement {
    if (failed) {
        return <Panel status="error"><p>Failed to get appointment language summary</p></Panel>;
    }

    if (data.length === 0) {
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <></>;
    }

    return (
        <div>
            <div className="ons-summary ons-u-mb-m ons-elementToFadeIn ons-u-mt-m">
                <div className="ons-summary__group">
                    <h2 className="ons-summary__group-title">Appointment language summary</h2>
                    <table className="ons-summary__items ons-u-mt-s">
                        <thead className="ons-u-vh">
                            <tr>
                                <th>Language</th>
                                <th>Total appointments</th>
                            </tr>
                        </thead>
                        {
                            data.map(({ language, total }: AppointmentResourcePlanningSummaryReportData) => (
                                <tbody className="ons-summary__item" key={language}>
                                    <tr
                                        className="ons-summary__row ons-summary__row--has-values"
                                        data-testid="summary-table-row"
                                    >
                                        <td className="ons-summary__item-title">
                                            <div className="ons-summary__item--text">
                                                {language}
                                            </div>
                                        </td>
                                        <td className="ons-summary__values">
                                            {total}
                                        </td>
                                    </tr>
                                </tbody>
                            ))
                        }
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AppointmentSummary;
