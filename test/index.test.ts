import { describe, it } from "node:test";
import { strict as assert } from "assert";
import { sheetToJson } from "../src/index.ts";

describe("sheetToJson", () => {
  it("should return null if the sheet is not found", async () => {
    const data = await sheetToJson<Record<string, string>>("not-found");
    assert.strictEqual(data, null);
  });

  it("should return null if the sheet is not published", async () => {
    const data = await sheetToJson<Record<string, string>>(
      "1qoJn6Aqsl0rK_uarnlx6MENmqZMry8w8BiXijb3lPHg"
    );
    assert.strictEqual(data, null);
  });

  it("should return the data from the sheet", async () => {
    const data = await sheetToJson<Record<string, string>>(
      "1X0dEWc5rUQdDXCoqEYuQ6w60gUnemeuwlY_THR8oAB4"
    );
    assert.ok(data);
    assert.ok(data.data);
    assert.ok(data.dataFormated);
    assert.ok(data.data.length > 0);
    assert.ok(data.dataFormated.length > 0);
    assert.ok(data.data.length === data.dataFormated.length);
  });
});
