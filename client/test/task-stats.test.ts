import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeTaskStats } from "../src/components/helper/task-stats.ts";
import type { ITaskResponce } from "../src/types/index.ts";

describe("computeTaskStats", () => {
  it("should calculate correct statistics for empty task list", () => {
    const stats = computeTaskStats([]);
    assert.equal(stats.total, 0);
    assert.equal(stats.pending, 0);
    assert.equal(stats.inProgress, 0);
    assert.equal(stats.done, 0);
    assert.equal(stats.rejected, 0);
  });

  it("should calculate percentages correctly", () => {
    const tasks: Partial<ITaskResponce>[] = [
      { id: 1, order: "0" } as ITaskResponce,
      { id: 2, order: "1" } as ITaskResponce,
      { id: 3, order: "2" } as ITaskResponce,
      { id: 4, order: "2" } as ITaskResponce,
    ];

    const stats = computeTaskStats(tasks as ITaskResponce[]);
    assert.equal(stats.total, 4);
    assert.equal(stats.pending, 1);
    assert.equal(stats.inProgress, 1);
    assert.equal(stats.done, 2);
    assert.equal(stats.rejected, 0);
    assert.equal(stats.donePct, 50);
  });
});
