import { INestApplication } from "@nestjs/common";
import request from "supertest";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import { createE2ETest } from "../../../test/create-e2e-test";
import { createUserFactory, User } from "../../../test/factory/user.factory";
import { DatabasePg } from "../../../src/common";
import { truncateTables } from "../../../test/helpers/test-helpers";
import {
  createQueueTestHarness,
  QueueTestHarness,
} from "../../../test/helpers/bullmq-test-utils";
import { FileStorageAdapter } from "src/file-storage/adapters/file-storage.adapter";
import { UploadFileInput, UploadFileResult } from "src/file-storage";
import { CV_ANALYSIS_QUEUE } from "../cv-analysis.queue";

/** In-memory stand-in for S3 so the e2e suite only needs Postgres + Redis. */
class InMemoryFileStorageAdapter extends FileStorageAdapter {
  private readonly objects = new Map<string, Buffer>();

  async uploadFile(input: UploadFileInput): Promise<UploadFileResult> {
    this.objects.set(input.key, Buffer.from(input.body as Buffer));
    return { bucket: "memory", key: input.key };
  }

  async deleteFile(key: string): Promise<void> {
    this.objects.delete(key);
  }

  async downloadFile(key: string): Promise<Buffer> {
    const body = this.objects.get(key);
    if (!body) throw new Error(`Missing object ${key}`);
    return body;
  }
}

const CV_TEXT = `Jan Kowalski
Senior TypeScript developer with 7 years of experience.
Built NestJS and React applications backed by PostgreSQL and Redis on AWS.`;

const JOB_TEXT = `Senior Fullstack Engineer. Requirements: TypeScript, React, NestJS, PostgreSQL, Kubernetes.`;

describe("CvAnalysisController (e2e)", () => {
  let app: INestApplication;
  let db: DatabasePg;
  let testUser: User;
  let cookies: string;
  let userFactory: ReturnType<typeof createUserFactory>;
  let queueHarness: QueueTestHarness;

  beforeAll(async () => {
    const created = await createE2ETest([
      {
        provide: FileStorageAdapter,
        useValue: new InMemoryFileStorageAdapter(),
      },
    ]);
    app = created.app;
    db = created.db;
    userFactory = createUserFactory(db);
    queueHarness = await createQueueTestHarness(app, CV_ANALYSIS_QUEUE.name);
  });

  afterAll(async () => {
    await queueHarness?.dispose();
    await app?.close();
  });

  beforeEach(async () => {
    testUser = userFactory.build();

    const registerResponse = await request(app.getHttpServer())
      .post("/api/auth/sign-up/email")
      .send({
        email: testUser.email,
        password: "password123",
        name: testUser.name,
      });

    testUser.id = registerResponse.body.user.id;
    cookies = registerResponse.headers["set-cookie"];
  });

  afterEach(async () => {
    await queueHarness?.cleanQueue();
    await truncateTables(db, ["cv_analysis", "file", "user"]);
  });

  it("rejects a request without a CV file", async () => {
    await request(app.getHttpServer())
      .post("/cv-analyses")
      .set("Cookie", cookies)
      .field("jobDescriptionText", JOB_TEXT)
      .expect(400);
  });

  it("creates an analysis, processes it in the background and exposes the result", async () => {
    const jobCompleted = queueHarness.waitForJobCompletion();

    const createResponse = await request(app.getHttpServer())
      .post("/cv-analyses")
      .set("Cookie", cookies)
      .field("title", "Jan - Fullstack")
      .field("jobDescriptionText", JOB_TEXT)
      .attach("cv", Buffer.from(CV_TEXT), {
        filename: "cv.txt",
        contentType: "text/plain",
      })
      .expect(201);

    const created = createResponse.body.data;
    expect(created.status).toBe("pending");
    expect(created.cvFile.originalName).toBe("cv.txt");

    await jobCompleted;

    const detailResponse = await request(app.getHttpServer())
      .get(`/cv-analyses/${created.id}`)
      .set("Cookie", cookies)
      .expect(200);

    const detail = detailResponse.body.data;
    expect(detail.status).toBe("completed");
    expect(detail.progress).toBe(100);
    expect(detail.result.matchScore).toBeGreaterThan(0);
    expect(detail.result.matchedSkills).toContain("typescript");

    const listResponse = await request(app.getHttpServer())
      .get("/cv-analyses")
      .set("Cookie", cookies)
      .expect(200);

    expect(listResponse.body.data).toHaveLength(1);
    expect(listResponse.body.data[0].matchScore).toBe(detail.result.matchScore);
  });

  it("does not expose analyses of other users", async () => {
    const otherUser = userFactory.build();
    const otherRegister = await request(app.getHttpServer())
      .post("/api/auth/sign-up/email")
      .send({
        email: otherUser.email,
        password: "password123",
        name: otherUser.name,
      });

    const jobCompleted = queueHarness.waitForJobCompletion();
    const createResponse = await request(app.getHttpServer())
      .post("/cv-analyses")
      .set("Cookie", otherRegister.headers["set-cookie"])
      .field("jobDescriptionText", JOB_TEXT)
      .attach("cv", Buffer.from(CV_TEXT), {
        filename: "cv.txt",
        contentType: "text/plain",
      })
      .expect(201);
    await jobCompleted;

    await request(app.getHttpServer())
      .get(`/cv-analyses/${createResponse.body.data.id}`)
      .set("Cookie", cookies)
      .expect(404);
  });
});
