import React, {ReactElement} from "react";

interface InstrumentFilterPageProps {
    interviewer: string | undefined
    startDate: string | undefined
    endDate: string | undefined
    surveyTla: string | undefined
    submitFunction: () => void
}

function InstrumentFilter(props: InstrumentFilterPageProps): ReactElement {
    const {interviewer, startDate, endDate, surveyTla, submitFunction} = props;

    return (
        <>
            <div>
                Hello world
            </div>
        </>
    );
}

export default InstrumentFilter;
