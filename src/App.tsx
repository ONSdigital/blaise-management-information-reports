import React, {
    ReactElement, ReactNode, useCallback, useEffect, useMemo, useState,
} from "react";
import { Route, Switch, useLocation } from "react-router-dom";
import {
    BetaBanner,
    DefaultErrorBoundary,
    Footer,
    Header,
    ONSLoadingPanel,
} from "blaise-design-system-react-components";
import { AuthManager, LoginForm } from "blaise-login-react-client";
import "./style.css";
import InterviewerCallPattern from "./reports/InterviewerCallPattern/InterviewerCallPattern";
import AppointmentResourcePlanning from "./reports/AppointmentResourcePlanning/AppointmentResourcePlanning";
import InterviewerCallHistory from "./reports/InterviewerCallHistory/InterviewerCallHistory";
import ReportDetails from "./components/ReportDetails";

const divStyle = {
    minHeight: "calc(72vh)",
};

function App(): ReactElement {
    const authManager = useMemo(() => new AuthManager(), []);
    const location = useLocation();
    const [loaded, setLoaded] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        console.log(location);
        authManager.loggedIn().then(async (isLoggedIn: boolean) => {
            setLoggedIn(isLoggedIn);
            setLoaded(true);
        });
    });

    function loginPage(): ReactNode {
        if (loaded && loggedIn) {
            return null;
        }
        return <LoginForm authManager={authManager} setLoggedIn={setLoggedIn} />;
    }

    const signOut = useCallback((): void => {
        authManager.clearToken();
        setLoggedIn(false);
    }, [authManager, setLoggedIn]);

    function loading(): ReactNode {
        if (loaded) {
            return null;
        }
        return <ONSLoadingPanel />;
    }

    function app(): ReactElement | undefined {
        if (loaded && loggedIn) {
            return (
                <DefaultErrorBoundary>
                    <Switch>
                        <Route path="/interviewer-call-history">
                            <InterviewerCallHistory />
                        </Route>
                        <Route path="/interviewer-call-pattern">
                            <InterviewerCallPattern />
                        </Route>
                        <Route path="/appointment-resource-planning">
                            <AppointmentResourcePlanning />
                        </Route>
                        <Route path="/">
                            <main id="main-content" className="page__main u-mt-no">
                                <h1 className="u-mt-m">Reports</h1>
                                <div className="grid grid--column@xxs@s u-mt-m">
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
                        </Route>
                    </Switch>
                </DefaultErrorBoundary>
            );
        }
        return undefined;
    }

    return (
        <>
            <a className="skip__link" href="#main-content">Skip to main content</a>
            <BetaBanner />
            <Header
                title="Management Information Reports"
                signOutButton={loggedIn}
                noSave
                signOutFunction={signOut}
            />
            <div style={divStyle} className="page__container container">
                {loading()}
                {loginPage()}
                {app()}
            </div>
            <Footer />
        </>
    );
}

export default App;
