import React, { ReactElement } from "react";
import { Link } from "react-router-dom";

interface ReportDetailsProps {
    link: string
    title: string
    description: string
}

function ReportDetails({
    description,
    link,
    title,
}: ReportDetailsProps): ReactElement {
    return (
        <div className="ons-grid__col ons-col-6@m">
            <div className="ons-card" aria-labelledby={link} aria-describedby={`${link}-text`}>
                <h2 className="ons-u-fs-m" id={link}>
                    <Link to={link}>
                        {title}
                    </Link>
                </h2>
                <p id="interviewer-call-history-text">{description}</p>
            </div>
        </div>
    );
}

export default ReportDetails;
