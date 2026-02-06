import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?:
      | "audio/mpeg"
      | "audio/wav"
      | "application/pdf"
      | "audio/mp4"
      | "video/mp4";
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice =
  | ToolChoicePrimitive
  | ToolChoiceByName
  | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  model?: string; // Optional model override
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

const ensureArray = (
  value: MessageContent | MessageContent[]
): MessageContent[] => (Array.isArray(value) ? value : [value]);

const normalizeContentPart = (
  part: MessageContent
): TextContent | ImageContent | FileContent => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }

  if (part.type === "text") {
    return part;
  }

  if (part.type === "image_url") {
    return part;
  }

  if (part.type === "file_url") {
    return part;
  }

  throw new Error("Unsupported message content part");
};

const normalizeMessage = (message: Message) => {
  const { role, name, tool_call_id } = message;

  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content)
      .map(part => (typeof part === "string" ? part : JSON.stringify(part)))
      .join("\n");

    return {
      role,
      name,
      tool_call_id,
      content,
    };
  }

  const contentParts = ensureArray(message.content).map(normalizeContentPart);

  // If there's only text content, collapse to a single string for compatibility
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text,
    };
  }

  return {
    role,
    name,
    content: contentParts,
  };
};

const normalizeToolChoice = (
  toolChoice: ToolChoice | undefined,
  tools: Tool[] | undefined
): "none" | "auto" | ToolChoiceExplicit | undefined => {
  if (!toolChoice) return undefined;

  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }

  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }

    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }

    return {
      type: "function",
      function: { name: tools[0].function.name },
    };
  }

  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name },
    };
  }

  return toolChoice;
};

// LLM uses only OPENAI_API_KEY and api.openai.com (no Forge fallback for chat).
const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";

const assertApiKey = () => {
  if (!ENV.openaiApiKey || ENV.openaiApiKey.trim() === "") {
    throw new Error(
      "OPENAI_API_KEY is not configured. Set OPENAI_API_KEY in environment variables."
    );
  }
};

const getApiKey = () => ENV.openaiApiKey;

const normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema,
}: {
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
}):
  | { type: "json_schema"; json_schema: JsonSchema }
  | { type: "text" }
  | { type: "json_object" }
  | undefined => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (
      explicitFormat.type === "json_schema" &&
      !explicitFormat.json_schema?.schema
    ) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }

  const schema = outputSchema || output_schema;
  if (!schema) return undefined;

  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }

  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...(typeof schema.strict === "boolean" ? { strict: schema.strict } : {}),
    },
  };
};

const LLM_MAX_RETRIES = 3;
const LLM_RETRY_DELAYS_MS = [1000, 2000, 4000];

function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 502 || status === 503 || status === 504;
}

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  assertApiKey();

  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
    model,
  } = params;

  const payload: Record<string, unknown> = {
    model: model || "gpt-4o-mini", // Default to cost-efficient model
    messages: messages.map(normalizeMessage),
  };

  if (tools && tools.length > 0) {
    payload.tools = tools;
  }

  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }

  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema,
  });

  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }

  const headers = {
    "content-type": "application/json",
    authorization: `Bearer ${getApiKey()}`,
  };
  const body = JSON.stringify(payload);

  // Platform: Railway proxy keep-alive 60s. Cap under 60s or production shows "fetch failed". See docs/DEBUGGING.md.
  const LLM_REQUEST_TIMEOUT_MS = 55_000;
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= LLM_MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        LLM_REQUEST_TIMEOUT_MS
      );
      const response = await fetch(OPENAI_CHAT_URL, {
        method: "POST",
        headers,
        body,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        return (await response.json()) as InvokeResult;
      }

      const errorText = await response.text();
      const err = new Error(
        `LLM invoke failed: ${response.status} ${response.statusText} – ${errorText}`
      );

      if (!isRetryableStatus(response.status) || attempt === LLM_MAX_RETRIES) {
        throw err;
      }

      lastError = err;
      const delayMs = LLM_RETRY_DELAYS_MS[attempt] ?? 4000;
      await new Promise(r => setTimeout(r, delayMs));
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      if (err.name === "AbortError") {
        const timeoutErr = new Error(
          "LLM request timed out. The AI is taking longer than expected—please try again."
        );
        if (attempt === LLM_MAX_RETRIES) throw timeoutErr;
        lastError = timeoutErr;
      } else {
        // Enrich "fetch failed" with cause so logs show root cause (e.g. ECONNREFUSED, ENOTFOUND, invalid API key)
        const cause = err.cause as NodeJS.ErrnoException | undefined;
        const code = cause?.code ?? (err as NodeJS.ErrnoException).code;
        const enrichedMessage =
          err.message === "fetch failed" && (code || cause?.message)
            ? `LLM fetch failed: ${[code, cause?.message].filter(Boolean).join(" – ")}`
            : err.message;
        const enrichedErr =
          enrichedMessage !== err.message
            ? Object.assign(new Error(enrichedMessage), {
                cause: err.cause ?? err,
                stack: err.stack,
              })
            : err;
        if (attempt === LLM_MAX_RETRIES) throw enrichedErr;
        lastError = enrichedErr;
      }
      const delayMs = LLM_RETRY_DELAYS_MS[attempt] ?? 4000;
      await new Promise(r => setTimeout(r, delayMs));
    }
  }

  throw lastError ?? new Error("LLM invoke failed after retries");
}

const CHECK_TIMEOUT_MS = 8_000;

/** Optional startup check: verify OpenAI key + egress. Log only; does not throw. */
export async function checkOpenAIReachable(): Promise<{
  ok: boolean;
  message: string;
}> {
  const key = ENV.openaiApiKey?.trim() ?? "";
  if (!key || key.length < 20) {
    return { ok: false, message: "OPENAI_API_KEY not set or too short" };
  }
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
    const res = await fetch(OPENAI_CHAT_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Say OK" }],
        max_tokens: 5,
      }),
      signal: controller.signal,
    });
    clearTimeout(t);
    if (res.ok) return { ok: true, message: "OK" };
    const text = await res.text();
    return {
      ok: false,
      message: `${res.status} ${res.statusText} – ${text.slice(0, 120)}`,
    };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    const code =
      (err as NodeJS.ErrnoException).code ??
      (err.cause as NodeJS.ErrnoException)?.code;
    const msg = code ? `fetch failed: ${code}` : err.message;
    return { ok: false, message: msg };
  }
}
