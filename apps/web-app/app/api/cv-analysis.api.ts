import { ApiClient } from "./api-client";
import type {
  CreateCvAnalysisInput,
  CvAnalysisDetail,
  CvAnalysisListItem
} from "./cv-analysis.types";

type Envelope<T> = { data: T };

const BASE_PATH = "/api/v1/cv-analyses";

/**
 * Hand-written adapter for the cv-analyses endpoints. It uses the axios
 * instance from the generated client so cookies/base URL stay consistent.
 * Run `pnpm generate:client` after starting the API to refresh the typed client.
 */
export const cvAnalysisApi = {
  list: async () => {
    const response =
      await ApiClient.instance.get<Envelope<CvAnalysisListItem[]>>(BASE_PATH);
    return response.data.data;
  },

  get: async (id: string) => {
    const response = await ApiClient.instance.get<Envelope<CvAnalysisDetail>>(
      `${BASE_PATH}/${id}`
    );
    return response.data.data;
  },

  create: async (input: CreateCvAnalysisInput) => {
    const formData = new FormData();
    formData.append("cv", input.cv);

    if (input.title?.trim()) {
      formData.append("title", input.title.trim());
    }

    if (input.jobDescriptionFile) {
      formData.append("jobDescription", input.jobDescriptionFile);
    } else if (input.jobDescriptionText?.trim()) {
      formData.append("jobDescriptionText", input.jobDescriptionText.trim());
    }

    const response = await ApiClient.instance.post<Envelope<CvAnalysisDetail>>(
      BASE_PATH,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data.data;
  },

  retry: async (id: string) => {
    const response = await ApiClient.instance.post<Envelope<CvAnalysisDetail>>(
      `${BASE_PATH}/${id}/retry`
    );
    return response.data.data;
  },

  remove: async (id: string) => {
    await ApiClient.instance.delete(`${BASE_PATH}/${id}`);
  }
};
