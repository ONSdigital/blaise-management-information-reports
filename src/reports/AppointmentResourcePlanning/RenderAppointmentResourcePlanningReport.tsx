import React, {useEffect, useState} from "react";
import Breadcrumbs from "../../components/Breadcrumbs";
import {CSVLink} from "react-csv";
import {AppointmentResourcePlanningReportData, AppointmentResourcePlanningSummaryReportData} from "../../interfaces";
import dateFormatter from "dayjs";
import {getAppointmentResourcePlanningReport, getAppointmentResourcePlanningSummaryReport} from "../../utilities/HTTP";
import AppointmentResourceDaybatchWarning from "./AppointmentResourceDaybatchWarning";
import ReportErrorPanel from "../../components/ReportErrorPanel";
import { AppointmentResults } from "./AppointmentResults";
import AppointmentSummary from "./AppointmentSummary";

interface RenderAppointmentResourcePlanningReportPageProps {
    reportDate: Date
    surveyTla: string
    instruments: string[]
    navigateBack: () => void
    navigateBackTwoSteps: () => void
}

function formatList(listOfInstruments: string[]): string {
    if (listOfInstruments.length === 1) return listOfInstruments[0];
    const firsts = listOfInstruments.slice(0, listOfInstruments.length - 1);
    const last = listOfInstruments[listOfInstruments.length - 1];
    return firsts.join(", ") + " and " + last;
}

function RenderAppointmentResourcePlanningReport(props: RenderAppointmentResourcePlanningReportPageProps) {
    const [reportFailed, setReportFailed] = useState<boolean>(false);
    const [reportData, setReportData] = useState<AppointmentResourcePlanningReportData[]>([]);
    const [messageNoData, setMessageNoData] = useState<string>("");
    const [summaryFailed, setSummaryFailed] = useState<boolean>(false);
    const [summaryData, setSummaryData] = useState<AppointmentResourcePlanningSummaryReportData[]>([]);

    const {
        reportDate,
        surveyTla,
        instruments,
        navigateBack,
        navigateBackTwoSteps,
    } = props;

    const reportExportHeaders = [
        { label: "Questionnaire", key: "questionnaire_name" },
        { label: "Appointment Time", key: "appointment_time" },
        { label: "Appointment Language", key: "appointment_language" },
        { label: "Total", key: "total" }
    ];
    
    useEffect(() => {
            runAppointmentResourcePlanningReport();
        }, []
    );

    useEffect(() => {
            runAppointmentSummary();
        }, []
    );

    async function runAppointmentResourcePlanningReport(): Promise<void> {
        setMessageNoData("");
        setReportFailed(false);
        setReportData([]);

        let planningReport: AppointmentResourcePlanningReportData[];
        try {
            planningReport = await getAppointmentResourcePlanningReport(reportDate, surveyTla);
        } catch {
            setReportFailed(true);
            return;
        } finally {
            //setSubmitting(false);
        }

        if (planningReport.length === 0) {
            setMessageNoData("No data found for parameters given.");
            return;
        }

        console.log(planningReport);
        setReportData(planningReport);
    }
    
    async function runAppointmentSummary(): Promise<void> {
        setSummaryData([]);
        setSummaryFailed(false);
        getAppointmentResourcePlanningSummaryReport(reportDate, surveyTla)
            .then((summaryReport: AppointmentResourcePlanningSummaryReportData[]) => {
                console.log(summaryReport);
                setSummaryData(summaryReport);
            }).catch(() => {
                setSummaryFailed(true);
            });
    }
    
    return (
        <>
            <Breadcrumbs BreadcrumbList={[{link: "/", title: "Reports"}, {link: "#", onClickFunction: navigateBackTwoSteps, title: "Appointment details"}, {link: "#", onClickFunction: navigateBack, title: "Questionnaires"}]}/>
            <main id="main-content" className="page__main u-mt-s">
            
                <h1 className="u-mb-m">
                        Appointment Resource Planning Report
                </h1>
                <h3 className="u-mb-m">
                        Date: {dateFormatter(reportDate).format("DD/MM/YYYY")}<br/>
                        Questionnaire{instruments.length > 1 ? ("s:") : ":"} {formatList(instruments)}{" "}
                </h3>
                <AppointmentResourceDaybatchWarning/>

                <ReportErrorPanel error={reportFailed} />
                
                <AppointmentSummary data={summaryData} failed={summaryFailed} />
                <div className=" u-mt-m">
                <CSVLink hidden={reportData === null || reportData.length === 0}
                        data={reportData}
                        headers={reportExportHeaders}
                        target="_blank"
                        filename={`appointment-resource-planning-report-${reportDate}.csv`}>
                        Export report as Comma-Separated Values (CSV) file
                </CSVLink>
                </div>
                <AppointmentResults reportData={reportData} messageNoData={messageNoData} />
            </main>
        </>
    );
}

export default RenderAppointmentResourcePlanningReport;