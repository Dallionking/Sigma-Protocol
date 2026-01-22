import { describe, it, expect } from "vitest";
import {
  createMockAgent,
  createMockMessage,
  createMockTask,
} from "./setup";

describe("Test Setup", () => {
  describe("Mock Factories", () => {
    it("should create a mock agent with defaults", () => {
      const agent = createMockAgent();

      expect(agent.id).toBe("agent-1");
      expect(agent.name).toBe("Test Agent");
      expect(agent.role).toBe("developer");
      expect(agent.status).toBe("idle");
    });

    it("should allow overriding mock agent properties", () => {
      const agent = createMockAgent({
        id: "custom-id",
        name: "Custom Agent",
        status: "working",
      });

      expect(agent.id).toBe("custom-id");
      expect(agent.name).toBe("Custom Agent");
      expect(agent.status).toBe("working");
      expect(agent.role).toBe("developer"); // default preserved
    });

    it("should create a mock message with defaults", () => {
      const message = createMockMessage();

      expect(message.id).toBe("msg-1");
      expect(message.content).toBe("Test message");
      expect(message.sender).toBe("user");
      expect(message.type).toBe("chat");
    });

    it("should create a mock task with defaults", () => {
      const task = createMockTask();

      expect(task.id).toBe("task-1");
      expect(task.title).toBe("Test Task");
      expect(task.status).toBe("todo");
      expect(task.priority).toBe("medium");
    });
  });

  describe("Browser API Mocks", () => {
    it("should have localStorage mocked", () => {
      localStorage.setItem("test-key", "test-value");
      expect(localStorage.getItem("test-key")).toBe("test-value");

      localStorage.removeItem("test-key");
      expect(localStorage.getItem("test-key")).toBeNull();
    });

    it("should have matchMedia mocked", () => {
      const mediaQuery = window.matchMedia("(min-width: 768px)");
      expect(mediaQuery.matches).toBe(false);
      expect(typeof mediaQuery.addEventListener).toBe("function");
    });

    it("should have ResizeObserver mocked", () => {
      const observer = new ResizeObserver(() => {});
      expect(typeof observer.observe).toBe("function");
      expect(typeof observer.unobserve).toBe("function");
      expect(typeof observer.disconnect).toBe("function");
    });

    it("should have IntersectionObserver mocked", () => {
      const observer = new IntersectionObserver(() => {});
      expect(typeof observer.observe).toBe("function");
      expect(typeof observer.unobserve).toBe("function");
      expect(typeof observer.disconnect).toBe("function");
    });

    it("should have requestAnimationFrame mocked", () => {
      expect(typeof window.requestAnimationFrame).toBe("function");
      expect(typeof window.cancelAnimationFrame).toBe("function");
    });
  });

  describe("Canvas Mocks", () => {
    it("should mock 2d canvas context", () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      expect(ctx).not.toBeNull();
      expect(typeof ctx?.fillRect).toBe("function");
      expect(typeof ctx?.drawImage).toBe("function");
    });

    it("should mock webgl canvas context", () => {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl");

      expect(gl).not.toBeNull();
      expect(typeof gl?.createTexture).toBe("function");
      expect(typeof gl?.drawArrays).toBe("function");
    });
  });
});
