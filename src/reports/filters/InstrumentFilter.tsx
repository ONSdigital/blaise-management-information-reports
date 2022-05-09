import React, {ReactElement, useEffect, useState, Fragment} from "react";
import Breadcrumbs from "../../components/Breadcrumbs";
import dateFormatter from "dayjs";
import axios, {AxiosRequestConfig, AxiosResponse} from "axios";
import {AuthManager} from "blaise-login-react-client";
import {
    FormFieldObject,
    ONSLoadingPanel,
    ONSPanel,
    StyledForm
} from "blaise-design-system-react-components";
import CallHistoryLastUpdatedStatus from "../../components/CallHistoryLastUpdatedStatus";

interface InstrumentFilterPageProps {
    interviewer: string
    startDate: Date
    endDate: Date
    surveyTla: string
    instruments: string[]
    setInstruments: (string: string[]) => void
    submitFunction: () => void
    navigateBack: () => void
}

function axiosConfig(): AxiosRequestConfig {
    const authManager = new AuthManager();
    return {
        headers: authManager.authHeader()
    };
}

function InstrumentFilter(props: InstrumentFilterPageProps): ReactElement {
    const [messageNoData, setMessageNoData] = useState<string>("");
    const [fields, setFields] = useState<FormFieldObject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [numberOfInstruments, setNumberOfInstruments] = useState(0);
    const {
        interviewer,
        startDate,
        endDate,
        surveyTla,
        submitFunction,
        navigateBack,
        instruments,
        setInstruments,
    } = props;


    useEffect(() => {
            getInstrumentList().then(setupForm);
        }, []
    );

    function setupForm(allInstruments: string[]) {
        setFields([
            {
                name: "questionnaires",
                type: "checkbox",
                initial_value: instruments,
                checkboxOptions: allInstruments.map(name => ({
                    id: name,
                    value: name,
                    label: name,
                })),
            },
        ]);
        setNumberOfInstruments(allInstruments.length);
        setIsLoading(false);
    }

    async function getInstrumentList(): Promise<string[]> {
        const url = "/api/instruments";

        const formData = new FormData();
        setMessageNoData("");
        formData.append("survey_tla", surveyTla);
        formData.append("interviewer", interviewer);
        formData.append("start_date", dateFormatter(startDate).format("YYYY-MM-DD"));
        formData.append("end_date", dateFormatter(endDate).format("YYYY-MM-DD"));

        return axios.post(url, formData, axiosConfig()).then((response: AxiosResponse) => {
            console.log(`Response: Status ${response.status}, data ${response.data}`);
            if (response.data === 0) {
                setMessageNoData("No data found for parameters given.");
                return;
            }
            if (response.status === 200) {
                return response.data;
            }
            throw ("Response was not 200");
        }).catch((error: Error) => {
            console.error(`Response: Error ${error}`);
            throw error;
        });
    }

    function handleSubmit(values: any) {
        setInstruments(values["questionnaires"]);
        submitFunction();
    }

    function displayCheckboxes() {
        if (isLoading) {
            return <ONSLoadingPanel/>;
        }
        if (numberOfInstruments === 0) {
            return <ONSPanel> No questionnaires found for given parameters.</ONSPanel>;
        }
        return <StyledForm fields={fields} submitLabel="Run report" onSubmitFunction={handleSubmit}/>;
    }

    return (
        <>
            <div>
                <Breadcrumbs
                    BreadcrumbList={[{link: "/", title: "Reports"}, {
                        link: "#",
                        onClickFunction: navigateBack,
                        title: "Interviewer details"
                    }]}/>

                <main id="main-content" className="page__main u-mt-s">
                    <h1 className="u-mb-m">Select questionnaires for <em className="highlight">{interviewer}</em>,
                        between <em className="highlight">{dateFormatter(startDate).format("DD/MM/YYYY")}</em> and <em
                            className="highlight">{dateFormatter(endDate).format("DD/MM/YYYY")}</em>
                    </h1>
                    <CallHistoryLastUpdatedStatus/>

                    <div className="input-items">
                        <div className="checkboxes__items">
                            {displayCheckboxes()}
                        </div>
                    </div>
                </main>

                <ONSPanel hidden={messageNoData === "" && true}>{messageNoData}</ONSPanel>
            </div>
        </>
    );
}

export default InstrumentFilter;
