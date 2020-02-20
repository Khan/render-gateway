// @flow
import * as DebugAgent from "@google-cloud/debug-agent";
import * as Profiler from "@google-cloud/profiler";
import {setupStackdriver} from "../setup-stackdriver.js";

jest.mock("@google-cloud/debug-agent");
jest.mock("@google-cloud/profiler");

describe("#setupStackdriver", () => {
    describe("in production", () => {
        it("should setup @google-cloud/debug-agent", async () => {
            // Arrange
            const agentSpy = jest.spyOn(DebugAgent, "start");

            // Act
            await setupStackdriver("production");

            // Assert
            expect(agentSpy).toHaveBeenCalled();
        });
      
        it("should setup @google-cloud/profiler", async () => {
            // Arrange
            const agentSpy = jest.spyOn(Profiler, "start");

            // Act
            await setupStackdriver("production");

            // Assert
            expect(agentSpy).toHaveBeenCalled();
        });
    });

    describe("not in production", () => {
        it("should not setup @google-cloud/debug-agent", async () => {
            // Arrange
            const agentSpy = jest.spyOn(DebugAgent, "start");

            // Act
            await setupStackdriver("development");

            // Assert
            expect(agentSpy).not.toHaveBeenCalled();
        });

        it("should not setup @google-cloud/profiler", async () => {
            // Arrange
            const agentSpy = jest.spyOn(Profiler, "start");

            // Act
            await setupStackdriver("development");

            // Assert
            expect(agentSpy).not.toHaveBeenCalled();
        });
    });
});
