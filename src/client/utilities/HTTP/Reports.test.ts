import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { getQuestionnaireList, getInterviewerCallHistoryReport } from ".";
import { InterviewerCallHistoryReport } from "../../interfaces";

const mockAdapter = new MockAdapter(axios);

describe("getQuestionnaireList", () => {
    afterEach(() => {
        mockAdapter.reset();
    });

    it("posts the search parameters", async () => {
        expect.assertions(4);
        mockAdapter.onPost(
            "/api/questionnaires",
            {
                asymmetricMatch: (formData: FormData) => {
                    expect(formData.get("survey_tla")).toBe("DST");
                    expect(formData.get("interviewer")).toBe("James");
                    expect(formData.get("start_date")).toBe("2022-01-02");
                    expect(formData.get("end_date")).toBe("2022-02-05");
                    return true;
                },
            },
        ).reply(200, []);

        await getQuestionnaireList("DST", "James", new Date("2022-01-02"), new Date("2022-02-05"));
    });

    it("returns the questionnaires", async () => {
        mockAdapter.onPost("/api/questionnaires").reply(200, ["INST_01", "INST_02"]);
        expect(await getQuestionnaireList(
            "DST",
            "James",
            new Date("2022-01-02"),
            new Date("2022-02-05"),
        )).toEqual(["INST_01", "INST_02"]);
    });

    it("rejects when error status is returned", async () => {
        mockAdapter.onPost("/api/questionnaires").reply(500, "error");
        expect.assertions(1);
        try {
            await getQuestionnaireList(
                "DST",
                "James",
                new Date("2022-01-02"),
                new Date("2022-02-05"),
            );
        } catch (e) {
            expect(e.message).toBe("Request failed with status code 500");
        }
    });

    it("rejects when error status is not 200", async () => {
        mockAdapter.onPost("/api/questionnaires").reply(201, "error");
        expect.assertions(1);
        try {
            await getQuestionnaireList(
                "DST",
                "James",
                new Date("2022-01-02"),
                new Date("2022-02-05"),
            );
        } catch (e) {
            expect(e.message).toBe("Response was not 200");
        }
    });
});

describe("getInterviewerCallHistoryReport", () => {
    const testFormParameters = {
        survey_tla: "DST",
        interviewer: "James",
        start_date: "2022-01-02",
        end_date: "2022-02-05",
        questionnaires: "INST1,INST2",
    };

    const testQuestionnaireResponse: InterviewerCallHistoryReport = {
        questionnaire_name: "DST",
        serial_number: "9001",
        call_start_time: "2022-01-02 10:05:20",
        dial_secs: 50,
        outcome_code: "310",
    };

    afterEach(() => {
        mockAdapter.reset();
    });

    it("posts the search parameters", async () => {
        expect.assertions(5);
        mockAdapter.onPost(
            "/api/reports/interviewer-call-history",
            {
                asymmetricMatch: (formData: FormData) => {
                    expect(formData.get("survey_tla")).toBe("DST");
                    expect(formData.get("interviewer")).toBe("James");
                    expect(formData.get("start_date")).toBe("2022-01-02");
                    expect(formData.get("end_date")).toBe("2022-02-05");
                    expect(formData.get("questionnaires")).toBe("INST1,INST2");
                    return true;
                },
            },
        ).reply(200, []);

        await getInterviewerCallHistoryReport(testFormParameters);
    });

    it("posts undefined for search values when they are missing", async () => {
        // This is strange behaviour, but it's the way it is currently working.
        // Perhaps an empty string, or a property typed input would be better
        expect.assertions(5);
        mockAdapter.onPost(
            "/api/reports/interviewer-call-history",
            {
                asymmetricMatch: (formData: FormData) => {
                    expect(formData.get("survey_tla")).toBe("undefined");
                    expect(formData.get("interviewer")).toBe("undefined");
                    expect(formData.get("start_date")).toBe("undefined");
                    expect(formData.get("end_date")).toBe("undefined");
                    expect(formData.get("questionnaires")).toBe("undefined");
                    return true;
                },
            },
        ).reply(200, []);

        await getInterviewerCallHistoryReport({});
    });

    it("returns the questionnaires", async () => {
        mockAdapter.onPost("/api/reports/interviewer-call-history").reply(200, [testQuestionnaireResponse]);
        expect(await getInterviewerCallHistoryReport(testFormParameters)).toEqual([testQuestionnaireResponse]);
    });

    it("defaults dial_secs to 0 if not in the response", async () => {
        const response: Record<string, unknown> = { ...testQuestionnaireResponse };
        delete response.dial_secs;
        mockAdapter.onPost("/api/reports/interviewer-call-history").reply(200, [response]);
        expect(await getInterviewerCallHistoryReport(testFormParameters)).toEqual([{ ...response, dial_secs: 0 }]);
    });

    it("defaults dial_secs to 0 if it is an empty string", async () => {
        const response: Record<string, unknown> = { ...testQuestionnaireResponse };
        mockAdapter.onPost("/api/reports/interviewer-call-history")
            .reply(200, [{ ...response, dial_secs: "" }]);
        expect(await getInterviewerCallHistoryReport(testFormParameters))
            .toEqual([{ ...response, dial_secs: 0 }]);
    });

    it("rejects when error status is returned", async () => {
        mockAdapter.onPost("/api/reports/interviewer-call-history").reply(500, "error");
        expect.assertions(1);
        try {
            await getInterviewerCallHistoryReport(testFormParameters);
        } catch (e) {
            expect(e.message).toBe("Request failed with status code 500");
        }
    });

    it("rejects when error status is not 200", async () => {
        mockAdapter.onPost("/api/reports/interviewer-call-history").reply(201, "error");
        expect.assertions(1);
        try {
            await getInterviewerCallHistoryReport(testFormParameters);
        } catch (e) {
            expect(e.message).toBe("Response was not 200");
        }
    });
});
