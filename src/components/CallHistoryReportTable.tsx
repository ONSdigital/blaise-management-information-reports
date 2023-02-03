import React, { ReactElement } from "react";
import { ONSPanel } from "blaise-design-system-react-components";
import { InterviewerCallHistoryReport } from "../interfaces";
import { formatDateAndTime } from "../utilities/DateFormatter";
import { convertSecondsToMinutesAndSeconds } from "../utilities/Converters";

interface CallHistoryReportTableProps {
    reportData: any
    messageNoData: string
}

function isEmpty(reportData: any): boolean {
    return !(reportData && reportData.length > 0);
}

export default function callHistoryReportTable({ reportData, messageNoData }: CallHistoryReportTableProps): ReactElement {
    if (isEmpty(reportData)) {
        return <ONSPanel hidden={messageNoData === "" && true}>{messageNoData}</ONSPanel>;
    }

    /* eslint-disable react/no-array-index-key */
    return (
        <table id="report-table" className="ons-table u-mt-s">
            <thead className="ons-table__head u-mt-m">
                <tr className="ons-table__row">
                    <th scope="col" className="ons-table__header ">
                        <span>Questionnaire</span>
                    </th>
                    <th scope="col" className="ons-table__header ">
                        <span>Serial Number</span>
                    </th>
                    <th scope="col" className="ons-table__header ">
                        <span>Call Start Time</span>
                    </th>
                    <th scope="col" className="ons-table__header ">
                        <span>Call Length</span>
                    </th>
                    <th scope="col" className="ons-table__header ">
                        <span>Call Result</span>
                    </th>
                    <th scope="col" className="ons-table__header ">
                        <span>Outcome Code</span>
                    </th>
                </tr>
            </thead>
            <tbody className="ons-table__body">
                {
                    reportData.map((callHistory: InterviewerCallHistoryReport, index: number) => (
                        <tr
                            className="ons-table__row"
                            key={index}
                            data-testid="report-table-row"
                        >
                            <td className="ons-table__cell ">
                                {callHistory.questionnaire_name}
                            </td>
                            <td className="ons-table__cell ">
                                {callHistory.serial_number}
                            </td>
                            <td className="ons-table__cell ">
                                {formatDateAndTime(callHistory.call_start_time)}
                            </td>
                            <td className="ons-table__cell ">
                                {convertSecondsToMinutesAndSeconds(callHistory.dial_secs)}
                            </td>
                            <td className="ons-table__cell ">
                                {(callHistory.call_result === null ? "Unknown" : callHistory.call_result)}
                            </td>
                            <td className="ons-table__cell ">
                                {callHistory.outcome_code}
                            </td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    );
}
