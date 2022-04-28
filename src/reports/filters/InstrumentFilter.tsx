// TODO:
// Select all button
// Make checkboxes look pretty i.e. closer together
// Make checkboxes reflect the state i.e. buttons are selected when returning to this step
// Display "No questionnaires found"
// Spinny when getting the instruments
// Actually make it work!!

import React, {ReactElement, useEffect, useState, Fragment} from "react";
import Breadcrumbs from "../../components/Breadcrumbs";
import dateFormatter from "dayjs";
import axios, {AxiosRequestConfig, AxiosResponse} from "axios";
import {AuthManager} from "blaise-login-react-client";
import {ONSButton} from "blaise-design-system-react-components";

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
    const [instruments, setInstruments] = useState([] as string[]);
    const [selectInstruments, setSelectInstruments] = useState([] as string[]);


    const {
        interviewer,
        startDate,
        endDate,
        surveyTla,
        submitFunction,
        navigateBack,
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
        console.log(selectInstruments);
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
                    BreadcrumbList={[{link: "/", title: "Reports"}, {link: _navigateBack, title: "Interviewer details"}]}/>

                <div className="checkbox__items">
                    {
                        instruments.map((item: string) => {
                            return (
                                <Fragment key={item}>
                                    <p className="checkbox__item ">
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
                                    </p>
                                    <br/>
                                </Fragment>
                            );
                        })
                    }
                </div>

                <ONSButton
                    label={"Run report"}
                    primary={true}
                    loading={false}
                    id="confirm-questionnaires"
                    onClick={() => callNextPage()}/>
            </div>
        </>
    );
}

export default InstrumentFilter;
