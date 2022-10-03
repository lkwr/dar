import { BodyConverter } from "../transport/Transport.types.ts";

export const json: BodyConverter = (obj) => [JSON.stringify(obj), "application/json"];

export const text: BodyConverter = (obj) => {
  if (typeof obj !== "string") return;
  return [obj, "text/plain"];
};
