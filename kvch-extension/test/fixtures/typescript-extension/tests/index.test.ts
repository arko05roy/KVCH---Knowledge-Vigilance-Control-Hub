import { inspectEvent } from "../src/index.js";

if (inspectEvent({ content: "api_key=example" }).length !== 1) throw new Error("fixture should be executable");
