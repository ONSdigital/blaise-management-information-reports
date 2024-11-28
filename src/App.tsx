import React, { ReactElement } from "react";
import { Route, Routes } from "react-router-dom";
import {
    BetaBanner, DefaultErrorBoundary, Footer, Header,
} from "blaise-design-system-react-components";
import { Authenticate } from "blaise-login-react/blaise-login-react-client";
import "./style.css";
import InterviewerCallPattern from "./reports/InterviewerCallPattern/InterviewerCallPattern";
import AppointmentResourcePlanning from "./reports/AppointmentResourcePlanning/AppointmentResourcePlanning";
import InterviewerCallHistory from "./reports/InterviewerCallHistory/InterviewerCallHistory";
import ReportDetails from "./components/ReportDetails";

const divStyle = {
    minHeight: "calc(72vh)",
};

function App(): ReactElement {
    // eslint-disable-next-line react/no-unstable-nested-components
    function AppContent(): ReactElement {
        return (
            <DefaultErrorBoundary>
                <Routes>
                    <Route
                        path="/interviewer-call-history"
                        element={<InterviewerCallHistory />}
                    />
                    <Route
                        path="/interviewer-call-pattern"
                        element={<InterviewerCallPattern />}
                    />
                    <Route
                        path="/appointment-resource-planning"
                        element={<AppointmentResourcePlanning />}
                    />
                    <Route
                        path="/"
                        element={
                            (
                                <main id="main-content" className="ons-page__main ons-u-mt-no">
                                    <h1 className="ons-u-mt-m">Reports</h1>
                                    <div className="ons-grid ons-grid--column@xxs@s ons-u-mt-m">
                                        <ReportDetails
                                            link="/interviewer-call-history"
                                            title="Interviewer call history"
                                            description="Generate report to see an interviewers call history over a given date range."
                                        />
                                        <ReportDetails
                                            link="/interviewer-call-pattern"
                                            title="Interviewer call pattern"
                                            description="Generate report to analyse productivity of an interviewer over a given date range."
                                        />
                                        <ReportDetails
                                            link="/appointment-resource-planning"
                                            title="Appointment resource planning"
                                            description="Generate report to view the number of interview appointments scheduled for a given date."
                                        />
                                    </div>
                                </main>
                            )
                        }
                    />
                </Routes>
            </DefaultErrorBoundary>
        );
    }

    return (
        <Authenticate title="Management Information Reports">
            {(_user, loggedIn, logOutFunction) => (
                <>
                    <a className="ons-skip-link" href="#main-content">Skip to main content</a>
                    <BetaBanner />
                    <Header
                        title="Management Information Reports"
                        signOutButton={loggedIn}
                        noSave
                        signOutFunction={logOutFunction}
                    />
                    <div style={divStyle} className="ons-page__container ons-container">
                        <AppContent />
                    </div>
                    <Footer />
                </>
            )}
        </Authenticate>
    );
}

export default App;
