// TODO:
// Select all button
// Display "No questionnaires found"
// Spinny when getting the instruments
// Account for unknown i.e. deleted instruments

import React, {ReactElement, useEffect, useState, Fragment} from "react";
import Breadcrumbs from "../../components/Breadcrumbs";
import dateFormatter from "dayjs";
import axios, {AxiosRequestConfig, AxiosResponse} from "axios";
import {AuthManager} from "blaise-login-react-client";
import {ONSButton, ONSPanel} from "blaise-design-system-react-components";
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
    const [selectInstruments, setSelectInstruments] = useState([] as string[]);


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
            getInstrumentList().then(setInstruments);
        }, []
    );

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

    function callNextPage() {
        setInstruments(selectInstruments);
        submitFunction();
    }

    function updateCheckBox(event: React.ChangeEvent<HTMLInputElement>) {
        let newSelectInstruments = [...selectInstruments];
        if (event.target.checked) {
            newSelectInstruments.push(event.target.value);
        } else {
            newSelectInstruments = newSelectInstruments.filter(item => item != event.target.value);
        }
        setSelectInstruments(newSelectInstruments);
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
                    <h1 className="u-mb-m">Select questionnaire(s) for <em className="highlight">{interviewer}</em>, between <em className="highlight">{startDate}</em> and <em className="highlight">{endDate}</em></h1>
                    <CallHistoryLastUpdatedStatus/>



                    <div className="input-items">
                        <div className="checkboxes__items">
                            {
                                instruments.map((item: string) => {
                                    return (
                                        <Fragment key={item}>
                                            <span className="checkboxes__item ">
                                                <span className="checkbox">
                                                    <input
                                                        type="checkbox"
                                                        id={`install-${item}`}
                                                        className="checkbox__input js-checkbox"
                                                        value={item}
                                                        name="select-survey"
                                                        aria-label="No"
                                                        onChange={updateCheckBox}
                                                    />
                                                    <label className="checkbox__label "
                                                           htmlFor={`install-${item}`}>
                                                        {item}
                                                    </label>
                                                </span>
                                            </span>
                                            <br/>
                                        </Fragment>
                                    );
                                })
                            }
                        </div>
                    </div>
                </main>

                <ONSButton
                    label={"Run report"}
                    primary={true}
                    loading={false}
                    id="confirm-questionnaires"
                    onClick={() => callNextPage()}/>

            </div>
        </>
    )
        ;
}

export default InstrumentFilter;
