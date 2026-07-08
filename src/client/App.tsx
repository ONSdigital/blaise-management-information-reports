import React, { useEffect, useEffectEvent, useState, type ReactElement } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import {
    BetaBanner, DefaultErrorBoundary, Footer, Header,
} from "blaise-design-system-react-components";
import { AuthClient, LoginForm } from "blaise-login-react-client";
import { AUTH_EXPIRED_EVENT_NAME } from "./api/axiosConfig";
import { getSharedAuthOptions } from "../utilities/auth.js";
import { isProduction } from "../utilities/env";
import "./style.css";
import InterviewerCallPattern from "./reports/InterviewerCallPattern/InterviewerCallPattern";
import AppointmentResourcePlanning from "./reports/AppointmentResourcePlanning/AppointmentResourcePlanning";
import InterviewerCallHistory from "./reports/InterviewerCallHistory/InterviewerCallHistory";
import ReportDetails from "./components/ReportDetails";

const divStyle = {
    minHeight: "calc(72vh)",
};

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

function App(): ReactElement {
    const location = useLocation();
    const [errored, setErrored] = useState(false);
    const [authClient] = useState(() => new AuthClient(getSharedAuthOptions()));
    const [authState, setAuthState] = useState<"checking" | "unauthenticated" | "authenticated">(
        () => (authClient.getToken() == null ? "unauthenticated" : "checking"),
    );

    const updateAuthStateEffect = useEffectEvent((loggedIn: boolean) => {
        setAuthState(loggedIn ? "authenticated" : "unauthenticated");
    });

    function clearSession(): void {
        authClient.logOut();
        setErrored(false);
        setAuthState("unauthenticated");
    }

    const clearSessionEffect = useEffectEvent(clearSession);

    async function handleAuthenticated(token: string): Promise<void> {
        authClient.setToken(token);

        try {
            setAuthState((await authClient.loggedIn()) ? "authenticated" : "unauthenticated");
        } catch {
            clearSession();
        }
    }

    useEffect(() => {
        if (authClient.getToken() == null) {
            return;
        }

        void authClient
            .loggedIn()
            .then((loggedIn) => {
                updateAuthStateEffect(loggedIn);
            })
            .catch(() => {
                updateAuthStateEffect(false);
            });
    }, [authClient]);

    useEffect(() => {
        const onAuthExpired = () => {
            clearSessionEffect();
        };

        window.addEventListener(AUTH_EXPIRED_EVENT_NAME, onAuthExpired);

        return () => {
            window.removeEventListener(AUTH_EXPIRED_EVENT_NAME, onAuthExpired);
        };
    }, []);

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
                        currentLocation={location.pathname}
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
