import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MODEL = "gpt-5.6-luna";

const TOOLS: OpenAI.Responses.Tool[] = [
  {
    type: "function",
    name: "add_task",
    description: "Add a new task to one quadrant of the Eisenhower matrix.",
    parameters: {
      type: "object",
      properties: {
        quadrant: {
          type: "string",
          enum: ["do-first", "schedule", "delegate", "dont-do"],
          description:
            "do-first = urgent & important, schedule = important not urgent, delegate = urgent not important, dont-do = neither",
        },
        title: { type: "string", description: "The task's title" },
      },
      required: ["quadrant", "title"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: "function",
    name: "move_task",
    description: "Move an existing task to a different quadrant.",
    parameters: {
      type: "object",
      properties: {
        id: { type: "string", description: "The task's id" },
        quadrant: {
          type: "string",
          enum: ["do-first", "schedule", "delegate", "dont-do"],
        },
      },
      required: ["id", "quadrant"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: "function",
    name: "toggle_task",
    description: "Toggle a task's completed state (complete <-> incomplete).",
    parameters: {
      type: "object",
      properties: { id: { type: "string", description: "The task's id" } },
      required: ["id"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: "function",
    name: "delete_task",
    description: "Permanently delete a task.",
    parameters: {
      type: "object",
      properties: { id: { type: "string", description: "The task's id" } },
      required: ["id"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: "function",
    name: "add_goal",
    description: "Add a new weekly or monthly goal.",
    parameters: {
      type: "object",
      properties: {
        period: { type: "string", enum: ["weekly", "monthly"] },
        title: { type: "string", description: "The goal's title" },
      },
      required: ["period", "title"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: "function",
    name: "toggle_goal",
    description: "Toggle a goal's completed state (complete <-> incomplete).",
    parameters: {
      type: "object",
      properties: { id: { type: "string", description: "The goal's id" } },
      required: ["id"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: "function",
    name: "delete_goal",
    description: "Permanently delete a goal.",
    parameters: {
      type: "object",
      properties: { id: { type: "string", description: "The goal's id" } },
      required: ["id"],
      additionalProperties: false,
    },
    strict: true,
  },
];

const SYSTEM_PROMPT = `You are the in-app assistant for Eisenhower Grid, a task prioritization tool built on the Eisenhower Matrix (urgent/important). You can see the user's current tasks and goals (given below as JSON) and can act on them with the provided tools.

Quadrants: do-first (urgent & important), schedule (important, not urgent), delegate (urgent, not important), dont-do (neither).

When the user asks you to add, move, complete, or delete a task or goal, call the matching tool rather than just describing what to do. Match tasks/goals to the user's phrasing by title (case-insensitive, doesn't need to be exact) using the ids from the state below. If a request is ambiguous (e.g. multiple tasks share a similar title, or it's unclear which quadrant), ask a brief clarifying question instead of guessing. Keep replies short and conversational.

The state JSON below is the only source of truth for what tasks and goals currently exist — it reflects the result of every tool call you've made so far this conversation, already applied. Do not count how many times a title was mentioned in the conversation transcript; count only the entries actually present in this JSON right now.`;

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  const body = await req.json();
  const input = body.input as OpenAI.Responses.ResponseInputItem[];
  const state = body.state as unknown;

  const client = new OpenAI({ apiKey });

  try {
    const response = await client.responses.create({
      model: MODEL,
      instructions: `${SYSTEM_PROMPT}\n\nCurrent state:\n${JSON.stringify(state)}`,
      input,
      tools: TOOLS,
      reasoning: { effort: "high" },
    });

    return NextResponse.json({ output: response.output });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
