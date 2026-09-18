import { NestFactory } from "@nestjs/core";
import { VersioningType } from "@nestjs/common";
import { AppModule } from "./app.module";
import { configureNestJsTypebox } from "nestjs-typebox";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { exportSchemaToFile } from "./utils/save-swagger-to-file";
import { setupValidation } from "./utils/setup-validation";
import cookieParser from "cookie-parser";

import "dotenv/config";

configureNestJsTypebox({
  patchSwagger: true,
  setFormats: true,
});

async function bootstrap() {
  console.log(process.env.NODE_ENV);

  const environment = process.env.NODE_ENV || "production";

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    bodyParser: false,
    logger:
      environment === "production"
        ? ["error", "warn", "log"]
        : ["log", "error", "warn", "debug", "verbose"],
  });

  setupValidation();

  app.use(cookieParser());

  app.enableCors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://app.cvmatch.localhost",
      "http://localhost:3000",
    ],
    credentials: true,
  });

  app.setGlobalPrefix("api");
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1'
  })

  const config = new DocumentBuilder()
    .setTitle("CV Match API")
    .setDescription("CV vs. job description analysis with background processing and Claude")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);
  exportSchemaToFile(document);

  await app.listen(Number(process.env.PORT) || 3000);
}
bootstrap();
