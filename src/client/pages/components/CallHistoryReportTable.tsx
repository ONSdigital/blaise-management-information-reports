import { Panel } from "blaise-design-system-react-components";
import React, { type ReactElement } from "react";

import { type InterviewerCallHistoryReport } from "../../types/interfaces";
import { convertSecondsToMinutesAndSeconds } from "../../utils/converters.js";
import { formatDateAndTime } from "../../utils/dateFormatter.js";

interface CallHistoryReportTableProps {
  reportData: InterviewerCallHistoryReport[];
  messageNoData: string;
}

function isEmpty(reportData: InterviewerCallHistoryReport[]): boolean {
  return !(reportData && reportData.length > 0);
}

export default function callHistoryReportTable({
  reportData,
  messageNoData,
}: CallHistoryReportTableProps): ReactElement {
  if (isEmpty(reportData)) {
    return <Panel hidden={messageNoData === "" && true}>{messageNoData}</Panel>;
  }

  return (
    <table
      id="report-table"
      className="ons-table u-mt-s"
    >
      <thead className="ons-table__head u-mt-m">
        <tr className="ons-table__row">
          <th
            scope="col"
            className="ons-table__header "
          >
            <span>Questionnaire</span>
          </th>
          <th
            scope="col"
            className="ons-table__header "
          >
            <span>Serial Number</span>
          </th>
          <th
            scope="col"
            className="ons-table__header "
          >
            <span>Call Start Time</span>
          </th>
          <th
            scope="col"
            className="ons-table__header "
          >
            <span>Call Length</span>
          </th>
          <th
            scope="col"
            className="ons-table__header "
          >
            <span>Call Result</span>
          </th>
          <th
            scope="col"
            className="ons-table__header "
          >
            <span>Outcome Code</span>
          </th>
        </tr>
      </thead>
      <tbody className="ons-table__body">
        {reportData.map((callHistory: InterviewerCallHistoryReport) => (
          <tr
            className="ons-table__row"
            key={`${callHistory.questionnaire_name}-${callHistory.serial_number}-${callHistory.call_start_time}`}
            data-testid="report-table-row"
          >
            <td className="ons-table__cell ">{callHistory.questionnaire_name}</td>
            <td className="ons-table__cell ">{callHistory.serial_number}</td>
            <td className="ons-table__cell ">{formatDateAndTime(callHistory.call_start_time)}</td>
            <td className="ons-table__cell ">
              {convertSecondsToMinutesAndSeconds(callHistory.dial_secs)}
            </td>
            <td className="ons-table__cell ">
              {callHistory.call_result === null ? "Unknown" : callHistory.call_result}
            </td>
            <td className="ons-table__cell ">{callHistory.outcome_code}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
