import React, {ReactElement, useEffect, useState} from "react";
import Breadcrumbs from "../../components/Breadcrumbs";
import dateFormatter from "dayjs";
import axios, {AxiosRequestConfig, AxiosResponse} from "axios";
import {AuthManager} from "blaise-login-react-client";

interface InstrumentFilterPageProps {
    interviewer: string
    startDate: Date
    endDate: Date
    surveyTla: string
    instruments: string[]
    setInstruments: (string: string[]) => void
    submitFunction: () => void
    backFunction: () => void
}

function axiosConfig(): AxiosRequestConfig {
    const authManager = new AuthManager();
    return {
        headers: authManager.authHeader()
    };
}

function InstrumentFilter(props: InstrumentFilterPageProps): ReactElement {
    const [
        instruments, setInstruments
    ] = useState([] as string[]);

    const {
        interviewer,
        startDate,
        endDate,
        surveyTla,
        submitFunction,
        backFunction,
    } = props;


    useEffect(() => {
            getInstrumentList().then(setInstruments);
        }
    );

    async function submitInstrumentFilters(formValues: Record<string, any>, setSubmitting: (isSubmitting: boolean) => void): Promise<void> {
        setSubmitting(true);
        submitFunction();
        backFunction();
    }

    async function getInstrumentList(): Promise<string[]> {
        const url = "/api/reports/interviewer-call-history/instruments";
        const formData = new FormData();
        formData.append("survey_tla", surveyTla);
        formData.append("interviewer", interviewer);
        formData.append("start_date", dateFormatter(startDate).format("YYYY-MM-DD"));
        formData.append("end_date", dateFormatter(endDate).format("YYYY-MM-DD"));

        return axios.post(url, formData, axiosConfig()).then((response: AxiosResponse) => {
            console.log(`Response: Status ${response.status}, data ${response.data}`);
            if (response.status === 200) {
                return response.data;
            }
            throw ("Response was not 200");
        }).catch((error: Error) => {
            console.error(`Response: Error ${error}`);
            throw error;
        });
    }

    function _renderInstrumentList() {
        return instruments;
        //return instruments.join(",");
    }

    return (
        <>
            <div>
                <Breadcrumbs
                    BreadcrumbList={[{link: "/", title: "Reports"}, {link: "#", title: "Interviewer details"}]}/>
                {_renderInstrumentList()}
            </div>
        </>
    );
}

export default InstrumentFilter;
