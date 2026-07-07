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
    return (
        <ErrorBoundary errorMessageText="Failed to load">
            {
                reportData && reportData.length > 0
                    ? (
                        <table id="report-table" className="ons-table ons-elementToFadeIn ons-u-mt-s">
                            <thead className="ons-table__head u-mt-m">
                                <tr className="ons-table__row">
                                    <th scope="col" className="ons-table__header ">
                                        <span>Questionnaire</span>
                                    </th>
                                    <th scope="col" className="ons-table__header ">
                                        <span>Appointment Time</span>
                                    </th>
                                    <th scope="col" className="ons-table__header ">
                                        <span>Appointment Language</span>
                                    </th>
                                    <th scope="col" className="ons-table__header ">
                                        <span>Case Reference</span>
                                    </th>
                                    <th scope="col" className="ons-table__header ">
                                        <span>Telephone Number</span>
                                    </th>
                                    <th scope="col" className="ons-table__header ">
                                        <span>Respondent Name</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="ons-table__body">
                                {
                                    reportData.map((data: AppointmentResourcePlanningReportData) => (
                                        <tr
                                            className="ons-table__row"
                                            key={`${data.questionnaire_name}-${data.appointment_time}-${data.appointment_language}-${data.case_reference}`}
                                            data-testid="report-table-row"
                                        >
                                            <td className="ons-table__cell ">
                                                {data.questionnaire_name}
                                            </td>
                                            <td className="ons-table__cell ">
                                                {data.appointment_time}
                                            </td>
                                            <td className="ons-table__cell ">
                                                {data.appointment_language}
                                            </td>
                                            <td className="ons-table__cell ">
                                                {data.case_reference}
                                            </td>
                                            <td className="ons-table__cell ">
                                                {data.telephone_number?.replace(/'/g, "")}
                                            </td>
                                            <td className="ons-table__cell ">
                                                {data.respondent_name?.replace(/'/g, "")}
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
