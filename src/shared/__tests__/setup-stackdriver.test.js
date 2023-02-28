// @flow
import * as Profiler from "@google-cloud/profiler";
import {setupStackdriver} from "../setup-stackdriver.js";

describe("#setupStackdriver", () => {
    describe("in production", () => {
        it("should not setup @google-cloud/profiler when not set to", async () => {
            // Arrange
            const agentSpy = jest.spyOn(Profiler, "start");

            // Act
            await setupStackdriver("production");

            // Assert
            expect(agentSpy).not.toHaveBeenCalled();
        });

        it("should setup @google-cloud/profiler when set to", async () => {
            // Arrange
            const agentSpy = jest.spyOn(Profiler, "start");

            // Act
            await setupStackdriver("production", {profiler: true});

            // Assert
            expect(agentSpy).toHaveBeenCalled();
        });
    });

    describe("not in production", () => {
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
