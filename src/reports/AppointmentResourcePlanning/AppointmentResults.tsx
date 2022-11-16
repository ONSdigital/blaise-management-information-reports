import { ErrorBoundary, ONSPanel } from "blaise-design-system-react-components";
import React, { ReactElement } from "react";
import { AppointmentResourcePlanningReportData } from "../../interfaces";

interface Props {
    reportData: AppointmentResourcePlanningReportData[],
    messageNoData: string
}

export default function AppointmentResults({
    messageNoData,
    reportData,
}: Props): ReactElement {
    console.log(`data in the report is:${reportData}`);
    return (
        <ErrorBoundary errorMessageText="Failed to load">
            {
                reportData && reportData.length > 0
                    ? (
                        <table id="report-table" className="table elementToFadeIn u-mt-s">
                            <thead className="table__head u-mt-m">
                                <tr className="table__row">
                                    <th scope="col" className="table__header ">
                                        <span>Questionnaire</span>
                                    </th>
                                    <th scope="col" className="table__header ">
                                        <span>Appointment Time</span>
                                    </th>
                                    <th scope="col" className="table__header ">
                                        <span>Appointment Language</span>
                                    </th>
                                    <th scope="col" className="table__header ">
                                        <span>Case Reference</span>
                                    </th>
                                    <th scope="col" className="table__header ">
                                        <span>Telephone Number</span>
                                    </th>
                                    <th scope="col" className="table__header ">
                                        <span>Respondent Name</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="table__body">
                                {
                                    reportData.map((data: AppointmentResourcePlanningReportData) => (
                                        <tr
                                            className="table__row"
                                            key={`${data.questionnaire_name}-${data.appointment_time}-${data.appointment_language}-${data.case_reference}`}
                                            data-testid="report-table-row"
                                        >
                                            <td className="table__cell ">
                                                {data.questionnaire_name}
                                            </td>
                                            <td className="table__cell ">
                                                {data.appointment_time}
                                            </td>
                                            <td className="table__cell ">
                                                {data.appointment_language}
                                            </td>
                                            <td className="table__cell ">
                                                {data.case_reference}
                                            </td>
                                            <td className="table__cell ">
                                                {data.telephone_number}
                                            </td>
                                            <td className="table__cell ">
                                                {data.respondent_name}
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    )
                    : <ONSPanel hidden={messageNoData === "" && true}>{messageNoData}</ONSPanel>
            }
            <br />
        </ErrorBoundary>
    );
}
