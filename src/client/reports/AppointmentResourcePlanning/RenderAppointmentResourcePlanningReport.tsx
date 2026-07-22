import React, { type ReactElement, useEffect, useState } from "react";
import { CSVLink } from "react-csv";

import Breadcrumbs from "../../pages/components/Breadcrumbs";
import ReportErrorPanel from "../../pages/components/ReportErrorPanel";
import {
  getAppointmentResourcePlanningReport,
  getAppointmentResourcePlanningSummaryReport,
} from "../../query/http/index.js";
import {
  type AppointmentResourcePlanningReportData,
  type AppointmentResourcePlanningSummaryReportData,
} from "../../types/interfaces";
import { formatDate } from "../../utils/dateFormatter.js";

import AppointmentResourceDaybatchWarning from "./AppointmentResourceDaybatchWarning";
import AppointmentResults from "./AppointmentResults";
import AppointmentSummary from "./AppointmentSummary";

const CSVLinkComponent = CSVLink as unknown as React.ComponentType<any>;

interface RenderAppointmentResourcePlanningReportPageProps {
  reportDate: Date;
  surveyTla: string;
  questionnaires: string[];
  navigateBack: () => void;
  navigateBackTwoSteps: () => void;
}

function formatList(listOfQuestionnaires: string[]): string {
  if (listOfQuestionnaires.length === 1) return listOfQuestionnaires[0];
  const firsts = listOfQuestionnaires.slice(0, listOfQuestionnaires.length - 1);
  const last = listOfQuestionnaires[listOfQuestionnaires.length - 1];

  return `${firsts.join(", ")} and ${last}`;
}

function RenderAppointmentResourcePlanningReport(
  props: RenderAppointmentResourcePlanningReportPageProps,
): ReactElement {
  const [reportFailed, setReportFailed] = useState<boolean>(false);
  const [reportData, setReportData] = useState<AppointmentResourcePlanningReportData[]>([]);
  const [messageNoData, setMessageNoData] = useState<string>("");
  const [summaryFailed, setSummaryFailed] = useState<boolean>(false);
  const [summaryData, setSummaryData] = useState<AppointmentResourcePlanningSummaryReportData[]>(
    [],
  );

  const { reportDate, surveyTla, questionnaires, navigateBack, navigateBackTwoSteps } = props;

  const reportExportHeaders = [
    { label: "Questionnaire", key: "questionnaire_name" },
    { label: "Appointment Time", key: "appointment_time" },
    { label: "Appointment Language", key: "appointment_language" },
    { label: "Case Reference", key: "case_reference" },
    { label: "Telephone Number", key: "telephone_number" },
    { label: "Respondent Name", key: "respondent_name" },
  ];

  useEffect(() => {
    async function runAppointmentResourcePlanningReport(): Promise<void> {
      setMessageNoData("");
      setReportFailed(false);
      setReportData([]);

      let planningReport: AppointmentResourcePlanningReportData[];

      try {
        planningReport = await getAppointmentResourcePlanningReport(
          reportDate,
          surveyTla,
          questionnaires,
        );
      } catch {
        setReportFailed(true);

        return;
      } finally {
        // setSubmitting(false);
      }

      if (planningReport.length === 0) {
        setMessageNoData("No data found for parameters given.");

        return;
      }

      console.log(planningReport);
      setReportData(planningReport);
    }

    runAppointmentResourcePlanningReport();
  }, [questionnaires, reportDate, surveyTla]);

  useEffect(() => {
    async function runAppointmentSummary(): Promise<void> {
      setSummaryData([]);
      setSummaryFailed(false);
      getAppointmentResourcePlanningSummaryReport(reportDate, surveyTla, questionnaires)
        .then((summaryReport: AppointmentResourcePlanningSummaryReportData[]) => {
          console.log(summaryReport);
          setSummaryData(summaryReport);
        })
        .catch(() => {
          setSummaryFailed(true);
        });
    }

    runAppointmentSummary();
  }, [questionnaires, reportDate, surveyTla]);

  return (
    <>
      <Breadcrumbs
        BreadcrumbList={[
          { link: "/", title: "Reports" },
          {
            link: "#",
            onClickFunction: navigateBackTwoSteps,
            title: "Appointment details",
          },
          { link: "#", onClickFunction: navigateBack, title: "Questionnaires" },
        ]}
      />
      <main
        id="main-content"
        className="ons-page__main ons-u-mt-s"
      >
        <h1 className="ons-u-mb-m">Appointment Resource Planning Report</h1>
        <h3 className="ons-u-mb-m">
          Date: {formatDate(reportDate)}
          <br />
          Questionnaire{questionnaires.length > 1 ? "s:" : ":"} {formatList(questionnaires)}{" "}
        </h3>
        <AppointmentResourceDaybatchWarning />

        <ReportErrorPanel error={reportFailed} />

        <AppointmentSummary
          data={summaryData}
          failed={summaryFailed}
        />
        <h2 className="ons-u-mb-m">Appointment details</h2>
        <div className="ons-u-mt-m">
          <CSVLinkComponent
            hidden={reportData === null || reportData.length === 0}
            data={reportData}
            headers={reportExportHeaders}
            target="_blank"
            filename={`appointment-resource-planning-report-${reportDate}.csv`}
          >
            Export report as Comma-Separated Values (CSV) file
          </CSVLinkComponent>
        </div>
        <AppointmentResults
          reportData={reportData}
          messageNoData={messageNoData}
        />
      </main>
    </>
  );
}

export default RenderAppointmentResourcePlanningReport;
