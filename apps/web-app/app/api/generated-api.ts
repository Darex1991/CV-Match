/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface GetUsersResponse {
  data: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: date;
    updatedAt: date;
    role: string | null;
    banned: boolean | null;
    banReason: string | null;
    banExpires: date | null;
  }[];
}

export interface GetUserByIdResponse {
  data: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: date;
    updatedAt: date;
    role: string | null;
    banned: boolean | null;
    banReason: string | null;
    banExpires: date | null;
  };
}

export interface UploadUserImageResponse {
  data: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: date;
    updatedAt: date;
    role: string | null;
    banned: boolean | null;
    banReason: string | null;
    banExpires: date | null;
  };
}

export interface UpdateUserBody {
  /** @format email */
  email?: string;
}

export interface UpdateUserResponse {
  data: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: date;
    updatedAt: date;
    role: string | null;
    banned: boolean | null;
    banReason: string | null;
    banExpires: date | null;
  };
}

export type DeleteUserResponse = null;

export interface ListResponse {
  data: {
    /** @format uuid */
    id: string;
    title: string;
    status: "pending" | "extracting" | "analyzing" | "completed" | "failed";
    progress: number;
    matchScore: number | null;
    errorMessage: string | null;
    cvFile: {
      /** @format uuid */
      id: string;
      originalName: string;
      mimeType: string;
      byteSize: number;
    };
    createdAt: string;
    updatedAt: string;
  }[];
}

export interface GetByIdResponse {
  data: {
    /** @format uuid */
    id: string;
    title: string;
    status: "pending" | "extracting" | "analyzing" | "completed" | "failed";
    progress: number;
    errorMessage: string | null;
    cvFile: {
      /** @format uuid */
      id: string;
      originalName: string;
      mimeType: string;
      byteSize: number;
    };
    jobDescriptionFile: {
      /** @format uuid */
      id: string;
      originalName: string;
      mimeType: string;
      byteSize: number;
    } | null;
    jobDescriptionText: string | null;
    result: {
      /** Overall fit of the candidate for the role, from 0 (no fit) to 100 (perfect fit). */
      matchScore: number;
      /** strong_match: 80-100, good_match: 60-79, partial_match: 40-59, weak_match: 0-39. */
      verdict: "strong_match" | "good_match" | "partial_match" | "weak_match";
      /** Three to five sentences for the recruiter summarising the fit, written in the language of the job description. */
      summary: string;
      candidateProfile: {
        name: string | null;
        currentTitle: string | null;
        yearsOfExperience: number | null;
        location: string | null;
      };
      /** Skills, tools or qualifications required by the job that the CV clearly demonstrates. */
      matchedSkills: string[];
      /** Skills, tools or qualifications required by the job that the CV does not show. */
      missingSkills: string[];
      /** Concrete strengths of this candidate for this role. */
      strengths: string[];
      /** Concrete gaps or risks relative to the job requirements. */
      gaps: string[];
      /** Inconsistencies, unexplained gaps, or claims worth verifying. Empty when none. */
      redFlags: string[];
      /** Actionable suggestions on how the candidate could improve the CV for this role. */
      feedbackForCandidate: string[];
      /** Six to ten tailored interview questions covering every category. */
      interviewQuestions: {
        category: "technical" | "behavioral" | "experience" | "gap_probe";
        question: string;
        /** Why this question matters for this candidate and role. */
        rationale: string;
      }[];
    } | null;
    createdAt: string;
    updatedAt: string;
  };
}

export interface CreateResponse {
  data: {
    /** @format uuid */
    id: string;
    title: string;
    status: "pending" | "extracting" | "analyzing" | "completed" | "failed";
    progress: number;
    errorMessage: string | null;
    cvFile: {
      /** @format uuid */
      id: string;
      originalName: string;
      mimeType: string;
      byteSize: number;
    };
    jobDescriptionFile: {
      /** @format uuid */
      id: string;
      originalName: string;
      mimeType: string;
      byteSize: number;
    } | null;
    jobDescriptionText: string | null;
    result: {
      /** Overall fit of the candidate for the role, from 0 (no fit) to 100 (perfect fit). */
      matchScore: number;
      /** strong_match: 80-100, good_match: 60-79, partial_match: 40-59, weak_match: 0-39. */
      verdict: "strong_match" | "good_match" | "partial_match" | "weak_match";
      /** Three to five sentences for the recruiter summarising the fit, written in the language of the job description. */
      summary: string;
      candidateProfile: {
        name: string | null;
        currentTitle: string | null;
        yearsOfExperience: number | null;
        location: string | null;
      };
      /** Skills, tools or qualifications required by the job that the CV clearly demonstrates. */
      matchedSkills: string[];
      /** Skills, tools or qualifications required by the job that the CV does not show. */
      missingSkills: string[];
      /** Concrete strengths of this candidate for this role. */
      strengths: string[];
      /** Concrete gaps or risks relative to the job requirements. */
      gaps: string[];
      /** Inconsistencies, unexplained gaps, or claims worth verifying. Empty when none. */
      redFlags: string[];
      /** Actionable suggestions on how the candidate could improve the CV for this role. */
      feedbackForCandidate: string[];
      /** Six to ten tailored interview questions covering every category. */
      interviewQuestions: {
        category: "technical" | "behavioral" | "experience" | "gap_probe";
        question: string;
        /** Why this question matters for this candidate and role. */
        rationale: string;
      }[];
    } | null;
    createdAt: string;
    updatedAt: string;
  };
}

export interface RetryResponse {
  data: {
    /** @format uuid */
    id: string;
    title: string;
    status: "pending" | "extracting" | "analyzing" | "completed" | "failed";
    progress: number;
    errorMessage: string | null;
    cvFile: {
      /** @format uuid */
      id: string;
      originalName: string;
      mimeType: string;
      byteSize: number;
    };
    jobDescriptionFile: {
      /** @format uuid */
      id: string;
      originalName: string;
      mimeType: string;
      byteSize: number;
    } | null;
    jobDescriptionText: string | null;
    result: {
      /** Overall fit of the candidate for the role, from 0 (no fit) to 100 (perfect fit). */
      matchScore: number;
      /** strong_match: 80-100, good_match: 60-79, partial_match: 40-59, weak_match: 0-39. */
      verdict: "strong_match" | "good_match" | "partial_match" | "weak_match";
      /** Three to five sentences for the recruiter summarising the fit, written in the language of the job description. */
      summary: string;
      candidateProfile: {
        name: string | null;
        currentTitle: string | null;
        yearsOfExperience: number | null;
        location: string | null;
      };
      /** Skills, tools or qualifications required by the job that the CV clearly demonstrates. */
      matchedSkills: string[];
      /** Skills, tools or qualifications required by the job that the CV does not show. */
      missingSkills: string[];
      /** Concrete strengths of this candidate for this role. */
      strengths: string[];
      /** Concrete gaps or risks relative to the job requirements. */
      gaps: string[];
      /** Inconsistencies, unexplained gaps, or claims worth verifying. Empty when none. */
      redFlags: string[];
      /** Actionable suggestions on how the candidate could improve the CV for this role. */
      feedbackForCandidate: string[];
      /** Six to ten tailored interview questions covering every category. */
      interviewQuestions: {
        category: "technical" | "behavioral" | "experience" | "gap_probe";
        question: string;
        /** Why this question matters for this candidate and role. */
        rationale: string;
      }[];
    } | null;
    createdAt: string;
    updatedAt: string;
  };
}

export type DeleteResponse = null;

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title CV Match API
 * @version 1.0
 * @contact
 *
 * CV vs. job description analysis with background processing and Claude
 */
export class API<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerGetProfileV1
     * @request GET:/api/v1/users/me
     */
    usersControllerGetProfileV1: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/users/me`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerScheduleAlertEmailV1
     * @request GET:/api/v1/users/me/alert-email
     */
    usersControllerScheduleAlertEmailV1: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/users/me/alert-email`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerGetUsersV1
     * @request GET:/api/v1/users
     */
    usersControllerGetUsersV1: (params: RequestParams = {}) =>
      this.request<GetUsersResponse, any>({
        path: `/api/v1/users`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerGetUserByIdV1
     * @request GET:/api/v1/users/{id}
     */
    usersControllerGetUserByIdV1: (id: string, params: RequestParams = {}) =>
      this.request<GetUserByIdResponse, any>({
        path: `/api/v1/users/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerUpdateUserV1
     * @request PATCH:/api/v1/users/{id}
     */
    usersControllerUpdateUserV1: (
      id: string,
      data: UpdateUserBody,
      params: RequestParams = {},
    ) =>
      this.request<UpdateUserResponse, any>({
        path: `/api/v1/users/${id}`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerDeleteUserV1
     * @request DELETE:/api/v1/users/{id}
     */
    usersControllerDeleteUserV1: (id: string, params: RequestParams = {}) =>
      this.request<DeleteUserResponse, any>({
        path: `/api/v1/users/${id}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersControllerUploadUserImageV1
     * @request POST:/api/v1/users/{id}/image
     */
    usersControllerUploadUserImageV1: (
      id: string,
      params: RequestParams = {},
    ) =>
      this.request<UploadUserImageResponse, any>({
        path: `/api/v1/users/${id}/image`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags CvAnalysis
     * @name CvAnalysisControllerListV1
     * @request GET:/api/v1/cv-analyses
     */
    cvAnalysisControllerListV1: (params: RequestParams = {}) =>
      this.request<ListResponse, any>({
        path: `/api/v1/cv-analyses`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags CvAnalysis
     * @name CvAnalysisControllerCreateV1
     * @request POST:/api/v1/cv-analyses
     */
    cvAnalysisControllerCreateV1: (params: RequestParams = {}) =>
      this.request<CreateResponse, any>({
        path: `/api/v1/cv-analyses`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags CvAnalysis
     * @name CvAnalysisControllerGetByIdV1
     * @request GET:/api/v1/cv-analyses/{id}
     */
    cvAnalysisControllerGetByIdV1: (id: string, params: RequestParams = {}) =>
      this.request<GetByIdResponse, any>({
        path: `/api/v1/cv-analyses/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags CvAnalysis
     * @name CvAnalysisControllerDeleteV1
     * @request DELETE:/api/v1/cv-analyses/{id}
     */
    cvAnalysisControllerDeleteV1: (id: string, params: RequestParams = {}) =>
      this.request<DeleteResponse, any>({
        path: `/api/v1/cv-analyses/${id}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags CvAnalysis
     * @name CvAnalysisControllerRetryV1
     * @request POST:/api/v1/cv-analyses/{id}/retry
     */
    cvAnalysisControllerRetryV1: (id: string, params: RequestParams = {}) =>
      this.request<RetryResponse, any>({
        path: `/api/v1/cv-analyses/${id}/retry`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags TestConfig
     * @name TestConfigControllerSetupV1
     * @request POST:/api/v1/test-config/setup
     */
    testConfigControllerSetupV1: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/test-config/setup`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @tags TestConfig
     * @name TestConfigControllerTeardownV1
     * @request POST:/api/v1/test-config/teardown
     */
    testConfigControllerTeardownV1: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/v1/test-config/teardown`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Health
     * @name HealthControllerCheck
     * @request GET:/api/health
     */
    healthControllerCheck: (params: RequestParams = {}) =>
      this.request<
        {
          /** @example "ok" */
          status?: string;
          /** @example {"database":{"status":"up"}} */
          info?: Record<
            string,
            {
              status: string;
              [key: string]: any;
            }
          >;
          /** @example {} */
          error?: Record<
            string,
            {
              status: string;
              [key: string]: any;
            }
          >;
          /** @example {"database":{"status":"up"}} */
          details?: Record<
            string,
            {
              status: string;
              [key: string]: any;
            }
          >;
        },
        {
          /** @example "error" */
          status?: string;
          /** @example {"database":{"status":"up"}} */
          info?: Record<
            string,
            {
              status: string;
              [key: string]: any;
            }
          >;
          /** @example {"redis":{"status":"down","message":"Could not connect"}} */
          error?: Record<
            string,
            {
              status: string;
              [key: string]: any;
            }
          >;
          /** @example {"database":{"status":"up"},"redis":{"status":"down","message":"Could not connect"}} */
          details?: Record<
            string,
            {
              status: string;
              [key: string]: any;
            }
          >;
        }
      >({
        path: `/api/health`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
}
