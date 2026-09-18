import { registerAs } from "@nestjs/config";
import { Static, Type } from "@sinclair/typebox";
import { configValidator } from "src/utils/configValidator";

const schema = Type.Object({
  AI_ADAPTER: Type.Union([Type.Literal("anthropic"), Type.Literal("mock")]),
  ANTHROPIC_API_KEY: Type.Optional(Type.String()),
  ANTHROPIC_MODEL: Type.String(),
});

export type AiConfigSchema = Static<typeof schema>;

const validateAiConfig = configValidator(schema);

export default registerAs("ai", (): AiConfigSchema => {
  const values = {
    AI_ADAPTER: process.env.AI_ADAPTER ?? "anthropic",
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || undefined,
    ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL || "claude-opus-5",
  };

  return validateAiConfig(values);
});
