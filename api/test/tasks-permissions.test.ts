import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Task RBAC & Permissions Logic", () => {
  interface MemberMock {
    role: "OWNER" | "ADMIN" | "MEMBER";
    userId: number;
  }

  interface TaskMock {
    id: number;
    creatorId: number;
    assigneeId: number | null;
    organizationId: number;
    status: string;
    position: number;
  }

  function canFullEditTask(member: MemberMock, task: TaskMock): boolean {
    return (
      member.role === "OWNER" ||
      member.role === "ADMIN" ||
      task.creatorId === member.userId
    );
  }

  function canChangeTaskStatus(member: MemberMock, task: TaskMock): boolean {
    return (
      member.role === "OWNER" ||
      member.role === "ADMIN" ||
      task.creatorId === member.userId ||
      task.assigneeId === member.userId
    );
  }

  const alisherOwner: MemberMock = { role: "OWNER", userId: 1 };
  const marinaMember: MemberMock = { role: "MEMBER", userId: 2 };
  const rasulMember: MemberMock = { role: "MEMBER", userId: 3 };

  const rasulTask: TaskMock = {
    id: 101,
    creatorId: 1, // Создал Alisher (Owner)
    assigneeId: 3, // Назначена на Rasul
    organizationId: 1,
    status: "1",
    position: 1,
  };

  it("Owner (Alisher) can edit and change status of any task", () => {
    assert.equal(canFullEditTask(alisherOwner, rasulTask), true);
    assert.equal(canChangeTaskStatus(alisherOwner, rasulTask), true);
  });

  it("Assignee (Rasul) can change status of his own task, but cannot full-edit", () => {
    assert.equal(canChangeTaskStatus(rasulMember, rasulTask), true);
    assert.equal(canFullEditTask(rasulMember, rasulTask), false);
  });

  it("Other employee (Marina) cannot change status or edit Rasul's task", () => {
    assert.equal(canChangeTaskStatus(marinaMember, rasulTask), false);
    assert.equal(canFullEditTask(marinaMember, rasulTask), false);
  });
});
