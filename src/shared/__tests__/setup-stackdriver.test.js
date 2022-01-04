// @flow
import * as DebugAgent from "@google-cloud/debug-agent";
import {setupStackdriver} from "../setup-stackdriver.js";

jest.mock("@google-cloud/debug-agent");

describe("#setupStackdriver", () => {
    let Profiler;
    beforeEach(() => {
        jest.mock("@google-cloud/profiler");
        // Cannot import at the top as @google-cloud/profiler makes a fetch on
        // import and will cause errors in our test runs.
        Profiler = require("@google-cloud/profiler");
    });

    describe("in production", () => {
        it("should not setup @google-cloud/debug-agent if not set to", async () => {
            // Arrange
            const agentSpy = jest.spyOn(DebugAgent, "start");

            // Act
            await setupStackdriver("production");

            // Assert
            expect(agentSpy).not.toHaveBeenCalled();
        });

        it("should setup @google-cloud/debug-agent when options say so", async () => {
            // Arrange
            const agentSpy = jest.spyOn(DebugAgent, "start");

            // Act
            await setupStackdriver("production", {debugAgent: true});

            // Assert
            expect(agentSpy).toHaveBeenCalled();
        });

        it("should not setup @google-cloud/profiler when not set to", async () => {
            // Arrange
            const agentSpy = jest.spyOn(Profiler, "start").mockResolvedValue();

            // Act
            await setupStackdriver("production");

            // Assert
            expect(agentSpy).not.toHaveBeenCalled();
        });

        // it("should setup @google-cloud/profiler when set to", async () => {
        //     // Arrange
        //     const agentSpy = jest.spyOn(Profiler, "start");

        //     // Act
        //     await setupStackdriver("production", {profiler: true});

        //     // Assert
        //     expect(agentSpy).toHaveBeenCalled();
        // });
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

        // it("should not setup @google-cloud/profiler", async () => {
        //     // Arrange
        //     const agentSpy = jest.spyOn(Profiler, "start");

        //     // Act
        //     await setupStackdriver("development");

        //     // Assert
        //     expect(agentSpy).not.toHaveBeenCalled();
        // });
    });
});
