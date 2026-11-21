import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Task Reordering & Position Normalization", () => {
  interface SimpleTask {
    id: number;
    title: string;
    position: number;
    status: string;
  }

  function reorderWithinColumn(
    tasks: SimpleTask[],
    sourceId: number,
    targetId: number,
  ): SimpleTask[] {
    const sourceIndex = tasks.findIndex((t) => t.id === sourceId);
    const targetIndex = tasks.findIndex((t) => t.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
      return tasks;
    }

    const reordered = [...tasks];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    return reordered.map((item, idx) => ({
      ...item,
      position: idx + 1,
    }));
  }

  it("should swap positions cleanly when dragging Task 1 down onto Task 2", () => {
    const initialTasks: SimpleTask[] = [
      { id: 10, title: "Task A", position: 1, status: "1" },
      { id: 20, title: "Task B", position: 2, status: "1" },
    ];

    const result = reorderWithinColumn(initialTasks, 10, 20);

    assert.equal(result.length, 2);
    assert.equal(result[0].id, 20);
    assert.equal(result[0].position, 1);
    assert.equal(result[1].id, 10);
    assert.equal(result[1].position, 2);
  });

  it("should swap positions cleanly when dragging Task 2 up onto Task 1", () => {
    const initialTasks: SimpleTask[] = [
      { id: 20, title: "Task B", position: 1, status: "1" },
      { id: 10, title: "Task A", position: 2, status: "1" },
    ];

    const result = reorderWithinColumn(initialTasks, 10, 20);

    assert.equal(result.length, 2);
    assert.equal(result[0].id, 10);
    assert.equal(result[0].position, 1);
    assert.equal(result[1].id, 20);
    assert.equal(result[1].position, 2);
  });

  it("should normalize positions strictly to 1, 2, 3 without increasing to infinity", () => {
    const initialTasks: SimpleTask[] = [
      { id: 1, title: "T1", position: 1, status: "1" },
      { id: 2, title: "T2", position: 2, status: "1" },
      { id: 3, title: "T3", position: 3, status: "1" },
    ];

    // Drag T3 onto T1
    const step1 = reorderWithinColumn(initialTasks, 3, 1);
    assert.deepEqual(
      step1.map((t) => ({ id: t.id, pos: t.position })),
      [
        { id: 3, pos: 1 },
        { id: 1, pos: 2 },
        { id: 2, pos: 3 },
      ],
    );

    // Drag T1 down onto T2
    const step2 = reorderWithinColumn(step1, 1, 2);
    assert.deepEqual(
      step2.map((t) => ({ id: t.id, pos: t.position })),
      [
        { id: 3, pos: 1 },
        { id: 2, pos: 2 },
        { id: 1, pos: 3 },
      ],
    );
  });
});

