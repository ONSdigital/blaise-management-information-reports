import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import * as ServiceWorker from "./ServiceWorker";

ReactDOM.render(
    <React.StrictMode>
        {/* @ts-expect-error Server Component */}
        <Router>
            <App />
        </Router>
    </React.StrictMode>,
    document.getElementById("root"),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
ServiceWorker.unregister();
