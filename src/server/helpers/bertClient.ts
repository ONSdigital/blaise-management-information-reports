import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { IapProvider } from "blaise-iap-node-provider";

type CallHistoryStatus = {
  last_updated: string;
};

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
    const response = await this.get(url);

    if (response.status === 404 || response.status === 204) {
      return [""];
    }

    if (response.status !== 200) {
      throw new Error(`Error getting questionnaires from BERT. Status code: ${response.status}`);
    }

    return response.data;
  }

  async getInterviewerCallHistoryReport(url: string): Promise<AxiosResponse> {
    const response = await this.get(url);

    if (response.status === 404 || response.status === 204) {
      console.log("No data found for parameters given.");

      return response;
    }

    if (response.status !== 200) {
      throw new Error(
        `Error getting interviewer call history report from BERT. Status code: ${response.status}`,
      );
    }

    return response;
  }

  async getInterviewerCallPattern(url: string): Promise<AxiosResponse> {
    const response = await this.get(url);

    if (response.status === 404 || response.status === 204) {
      console.log("No data found for parameters given.");

      return response;
    }

    if (response.status !== 200) {
      throw new Error(
        `Error getting interviewer call pattern from BERT. Status code: ${response.status}`,
      );
    }

    return response;
  }

  async getAppointmentResourcePlanningReport(url: string): Promise<AxiosResponse> {
    const response = await this.get(url);

    if (response.status === 404 || response.status === 204) {
      console.log("No data found for parameters given.");

      return response;
    }

    if (response.status !== 200) {
      throw new Error(
        `Error getting appointment resource planning report from BERT. Status code: ${response.status}`,
      );
    }

    return response;
  }

  async getAppointmentQuestionnaires(url: string): Promise<AxiosResponse> {
    const response = await this.get(url);

    if (response.status === 404 || response.status === 204) {
      console.log("No data found for parameters given.");

      return response;
    }

    if (response.status !== 200) {
      throw new Error(
        `Error getting appointment questionnaires from BERT. Status code: ${response.status}`,
      );
    }

    return response;
  }

  async getAppointmentResourcePlanningSummaryReport(url: string): Promise<AxiosResponse> {
    const response = await this.get(url);

    if (response.status === 404 || response.status === 204) {
      console.log("No data found for parameters given.");

      return response;
    }

    if (response.status !== 200) {
      throw new Error(
        `Error getting appointment resource planning summary report from BERT. Status code: ${response.status}`,
      );
    }

    return response;
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

    console.log(`Making GET request to: ${this.bertUrl}${this.url(url)}`);
    const response = await this.httpClient.get(`${this.bertUrl}${this.url(url)}`, config);

    return response;
  }

  protected async post(url: string, data?: unknown): Promise<AxiosResponse> {
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
