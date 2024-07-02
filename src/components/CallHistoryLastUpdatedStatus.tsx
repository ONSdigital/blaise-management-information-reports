import React, { ReactElement, useEffect, useState } from "react";
import TimeAgo from "react-timeago";
import { getInterviewerCallHistoryStatus } from "../utilities/HTTP";
import { CallHistoryStatus } from "../interfaces";
import { formatDateAndTime } from "../utilities/DateFormatter";

function displayResult(reportLastUpdatedDate: Date | "") {
    const date = formatDateAndTime(reportLastUpdatedDate);

    if (date === "Invalid Date") {
        return "Invalid Date";
    }

    return ` (${date})`;
}

function ReportStatusText({
    reportStatusFailed,
    reportLastUpdatedDate,
}: { reportStatusFailed: boolean, reportLastUpdatedDate: Date | "" }) {
    if (reportStatusFailed) {
        return (<>Unknown</>);
    }

    return (
        <>
            {/* @ts-expect-error Server Component */}
            <TimeAgo live={false} date={reportLastUpdatedDate} />
            { reportLastUpdatedDate ? displayResult(reportLastUpdatedDate) : "Loading" }
        </>
    );
}

function CallHistoryLastUpdatedStatus(): ReactElement {
    const [reportLastUpdatedDate, setReportLastUpdatedDate] = useState<Date | "">("");
    const [reportStatusFailed, setReportStatusFailed] = useState<boolean>(false);

    useEffect(() => {
        getInterviewerCallHistoryStatus().then((callHistoryStatus: CallHistoryStatus | undefined) => {
            if (!callHistoryStatus) {
                setReportStatusFailed(true);
                return;
            }
            setReportLastUpdatedDate(new Date(callHistoryStatus.last_updated));
        });
    }, []);

    return (
        <>
            <p className="ons-u-fs-s u-mt-s" aria-live="polite">
                Data in this report was last updated: <b>
                    <ReportStatusText reportStatusFailed={reportStatusFailed} reportLastUpdatedDate={reportLastUpdatedDate} />
                </b>
            </p>
            <p className="ons-u-fs-s">
                Data in this report only goes back to the last 12 months.
            </p>
        </>
    );
}

export default CallHistoryLastUpdatedStatus;
