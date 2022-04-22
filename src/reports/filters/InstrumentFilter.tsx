import React, {ReactElement} from "react";
import Breadcrumbs from "../../components/Breadcrumbs";

interface InstrumentFilterPageProps {
    interviewer: string | undefined
    startDate: Date | undefined
    endDate: Date | undefined
    surveyTla: string | undefined
    submitFunction: () => void
    backFunction: () => void
}

function InstrumentFilter(props: InstrumentFilterPageProps): ReactElement {
    const {interviewer, startDate, endDate, surveyTla, submitFunction, backFunction} = props;

    return (
        <>
            <div>
                <Breadcrumbs BreadcrumbList={[
                    {link: "/", title: "Reports"},
                    {link: "#", title: "Interviewer details", onClickFunction:backFunction},
                    {link: "#", title: "Select instruments"}]}/>
                Hello world
            </div>
        </>
    );
}

export default InstrumentFilter;
