import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { IapProvider } from "blaise-iap-node-provider";
import { type CallHistoryStatus } from "../client/interfaces/index.js";

type PromiseResponse = [number, any, string];


export class BertClient {
    private readonly bertUrl: string;
    private authProvider: IapProvider;
    private httpClient: AxiosInstance;

    constructor(bertClientId: string, bertUrl: string) {
        this.bertUrl = bertUrl;
        this.httpClient = axios.create();
        this.authProvider = new IapProvider(bertClientId);
    }

    async getCallHistoryStatus(): Promise<CallHistoryStatus | undefined> {
        const url = "/api/reports/call-history-status";

        const response = await this.get(url);

        if (response.status === 404 || response.status === 204) {
            return undefined;
        }

        if (response.status !== 200) {
            throw new Error(
                `Error getting call history status from BERT. Status code: ${response.status}`,
            );
        }

        return response.data;
    }

    async getQuestionnaires(url: string): Promise<[string]> {
        console.log("sidra 4-client");
        const response = await this.post(url);

        if (response.status === 404 || response.status === 204) {
            return [""];
        }

        if (response.status !== 200) {
            throw new Error(
                `Error getting questionnaires from BERT. Status code: ${response.status}`,
            );
        }

        return response.data;
    }

    async getInterviewerCallHistoryReport(url: string): Promise<PromiseResponse> {

        const response = await this.post(url, {});

        if (response.status === 404 || response.status === 204) {
            return [0, null, ""];
        }

        if (response.status !== 200) {
            throw new Error(
                `Error getting questionnaires from BERT. Status code: ${response.status}`,
            );
        }

        return response.data;
    }

    private url(url: string): string {
        if (!url.startsWith("/")) {
            url = `/${url}`;
        }

        return url;
    }

    protected async get(url: string): Promise<AxiosResponse> {
        const config = await this.axiosConfig();

        config.validateStatus = (statusCode: number) => {
            return [200, 204, 404].includes(statusCode);
        };

        const response = await this.httpClient.get(`${this.bertUrl}${this.url(url)}`, config);

        return response;
    }

    protected async post(url: string, data?: any): Promise<AxiosResponse> {

        console.log("sidra 5-going to rest api");
        const config = await this.axiosConfig();
        const finalURL = `${this.bertUrl}${this.url(url)}`;
        console.log(`Making POST request to: ${finalURL}`);
        const response = await this.httpClient.post(finalURL, data ? data : null, config);
        console.log(`Response: Status ${response.status}, data ${JSON.stringify(response.data)}`);
        return response;
    }

    private async axiosConfig(): Promise<AxiosRequestConfig> {
        let config = {};

        if (this.authProvider) {
            config = { headers: await this.authProvider.getAuthHeader() };
        }

        return config;
    }
}
