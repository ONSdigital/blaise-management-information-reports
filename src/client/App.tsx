import {
    DefaultErrorBoundary,
    Footer,
    Header,
    LoadingPanel,
    NotProductionWarning,
    Panel,
} from "blaise-design-system-react-components";
import { AuthClient, LoginForm } from "blaise-login-react-client";
import React, { type ReactElement, useEffect, useEffectEvent, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";

import { AUTH_EXPIRED_EVENT_NAME } from "./api/axiosConfig";
import ReportDetails from "./components/ReportDetails";
import AppointmentResourcePlanning from "./reports/AppointmentResourcePlanning/AppointmentResourcePlanning";
import InterviewerCallHistory from "./reports/InterviewerCallHistory/InterviewerCallHistory";
import InterviewerCallPattern from "./reports/InterviewerCallPattern/InterviewerCallPattern";
import { getSharedAuthOptions } from "./utils/auth.js";
import { isProduction } from "./utils/env";

function NotFound(): ReactElement {
    return (
        <main
            id="main-content"
            className="ons-page__main ons-u-mt-l"
        >
            <div className="ons-grid">
                <div className="ons-grid__col ons-col-8@m">
                    <h1>Page not found</h1>
                    <p>The page you're looking for doesn't exist.</p>
                    <Link to="/">Return home</Link>
                </div>
            </div>
        </main>
    );
}

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
                        <main
                            id="main-content"
                            className="ons-page__main ons-u-mt-no"
                        >
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
                    }
                />
                <Route
                    path="*"
                    element={<NotFound />}
                />
            </Routes>
        </DefaultErrorBoundary>
    );
}

function App(): ReactElement {
    const location = useLocation();
    const [authClient] = useState(() => new AuthClient(getSharedAuthOptions()));
    const [authState, setAuthState] = useState<"checking" | "unauthenticated" | "authenticated">(
        () => (authClient.getToken() == null ? "unauthenticated" : "checking"),
    );

    const updateAuthStateEffect = useEffectEvent((loggedIn: boolean) => {
        setAuthState(loggedIn ? "authenticated" : "unauthenticated");
    });

    function clearSession(): void {
        authClient.logOut();
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
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <a
                href="#main-content"
                className="ons-skip-to-content ons-u-fs-r--b"
            >
                Skip to content
            </a>
            {!isProduction(window.location.hostname) && <NotProductionWarning />}
            <Header
                title="Management Information Reports"
                signOutButton={authState === "authenticated"}
                noSave={true}
                signOutFunction={clearSession}
                currentLocation={location.pathname}
            />

            <div
                style={{ flexGrow: 1 }}
                className="ons-page__container ons-container"
            >
                {authState === "checking" && (
                    <main
                        id="main-content"
                        className="ons-page__main ons-u-mt-l"
                    >
                        <LoadingPanel />
                    </main>
                )}
                {authState === "unauthenticated" && (
                    <main
                        id="main-content"
                        className="ons-page__main ons-u-mt-l"
                    >
                        <Panel status="info">Enter your Blaise username and password</Panel>
                        <LoginForm onAuthenticated={handleAuthenticated} />
                    </main>
                )}
                {authState === "authenticated" && <AppContent />}
            </div>

            <Footer />
        </div>
    );
}

export default App;
