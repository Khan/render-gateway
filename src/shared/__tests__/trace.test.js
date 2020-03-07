// @flow
import {trace} from "../trace.js";

describe("#trace", () => {
    it.each([[""], [null], [undefined]])(
        "should throw if the name is empty/falsy",
        (testPoint) => {
            // Arrange
            const fakeLogger = ({}: any);

            // Act
            const underTest = () => trace(fakeLogger, testPoint);

            // Assert
            expect(underTest).toThrowErrorMatchingSnapshot();
        },
    );

    it("should log the start of the session", () => {
        // Arrange
        const fakeLogger = ({
            silly: jest.fn(),
            startTimer: jest.fn(),
        }: any);

        // Act
        trace(fakeLogger, "SESSION_NAME");

        // Assert
        expect(fakeLogger.silly).toHaveBeenCalledWith("TRACE: SESSION_NAME");
    });

    it("should start a timer", () => {
        // Arrange
        const fakeLogger = ({
            silly: jest.fn(),
            startTimer: jest.fn(),
        }: any);

        // Act
        trace(fakeLogger, "SESSION_NAME");

        // Assert
        expect(fakeLogger.startTimer).toHaveBeenCalled();
    });

    it("should create a tracer span", () => {
        // Arrange
        const fakeLogger: any = {
            silly: jest.fn(),
            startTimer: jest.fn(),
        };
        const fakeTracer: any = {
            createChildSpan: jest.fn(),
        };

        // Act
        trace(fakeLogger, "SESSION_NAME", fakeTracer);

        // Assert
        expect(fakeTracer.createChildSpan).toHaveBeenCalledWith({
            name: "TRACE: SESSION_NAME",
        });
    });

    it("should return a trace session", () => {
        // Arrange
        const fakeLogger: any = {
            silly: jest.fn(),
            startTimer: jest.fn(),
        };

        // Act
        const result = trace(fakeLogger, "SESSION_NAME");

        // Assert
        expect(result).toBeDefined();
    });

    describe("trace session", () => {
        describe("#name", () => {
            it("should give name of the trace", () => {
                // Arrange
                const fakeLogger: any = {
                    silly: jest.fn(),
                    startTimer: jest.fn(),
                };
                const session = trace(fakeLogger, "SESSION_NAME");

                // Act
                const result = session.name;

                // Assert
                expect(result).toBe("SESSION_NAME");
            });

            it("should be read-only", () => {
                // Arrange
                const fakeLogger: any = {
                    silly: jest.fn(),
                    startTimer: jest.fn(),
                };
                const session = trace(fakeLogger, "SESSION_NAME");

                // Act
                /**
                 * Flow is going to complain because name is readonly.
                 * We will suppress this because we want to test that runtime
                 * code is enforcing this. The idea of this test is to ensure
                 * that folks don't edit out this specific behavior.
                 * $ExpectError
                 */
                const underTest = () => (session.name = "NEW_NAME!");

                // Assert
                expect(underTest).toThrowErrorMatchingInlineSnapshot(
                    `"Cannot set property name of #<Object> which has only a getter"`,
                );
            });
        });

        describe("#end", () => {
            it("should stop the profile timer", () => {
                // Arrange
                const fakeTimer = {
                    done: jest.fn(),
                };
                const fakeLogger: any = {
                    silly: jest.fn(),
                    startTimer: jest.fn().mockReturnValue(fakeTimer),
                };
                const session = trace(fakeLogger, "SESSION_NAME");

                // Act
                session.end();

                // Assert
                expect(fakeTimer.done).toHaveBeenCalledWith({
                    message: "TRACED: SESSION_NAME",
                    level: "debug",
                });
            });

            it("should use the log level given", () => {
                // Arrange
                const fakeTimer = {
                    done: jest.fn(),
                };
                const fakeLogger: any = {
                    silly: jest.fn(),
                    startTimer: jest.fn().mockReturnValue(fakeTimer),
                };
                const session = trace(fakeLogger, "SESSION_NAME");

                // Act
                session.end({level: "silly"});

                // Assert
                expect(fakeTimer.done).toHaveBeenCalledWith({
                    message: "TRACED: SESSION_NAME",
                    level: "silly",
                });
            });

            it("should use the given metadata info", () => {
                // Arrange
                const fakeTimer = {
                    done: jest.fn(),
                };
                const fakeLogger: any = {
                    silly: jest.fn(),
                    startTimer: jest.fn().mockReturnValue(fakeTimer),
                };
                const session = trace(fakeLogger, "SESSION_NAME");

                // Act
                session.end({
                    cached: true,
                    size: 56,
                    someotherrubbish: "blahblahblah",
                });

                // Assert
                expect(fakeTimer.done).toHaveBeenCalledWith({
                    message: "TRACED: SESSION_NAME",
                    level: "debug",
                    cached: true,
                    size: 56,
                    someotherrubbish: "blahblahblah",
                });
            });

            it("should not allow message to be overridden", () => {
                // Arrange
                const fakeTimer = {
                    done: jest.fn(),
                };
                const fakeLogger: any = {
                    silly: jest.fn(),
                    startTimer: jest.fn().mockReturnValue(fakeTimer),
                };
                const session = trace(fakeLogger, "SESSION_NAME");

                // Act
                session.end({
                    message: "I secretly want to change the message",
                });

                // Assert
                expect(fakeTimer.done).toHaveBeenCalledWith({
                    message: "TRACED: SESSION_NAME",
                    level: "debug",
                });
            });

            it("should end the trace span", () => {
                // Arrange
                const fakeTraceSpan = {
                    endSpan: jest.fn(),
                };
                const fakeTracer: any = {
                    createChildSpan: jest.fn().mockReturnValue(fakeTraceSpan),
                };
                const fakeTimer = {
                    done: jest.fn(),
                };
                const fakeLogger: any = {
                    silly: jest.fn(),
                    startTimer: jest.fn().mockReturnValue(fakeTimer),
                };
                const session = trace(fakeLogger, "SESSION_NAME", fakeTracer);

                // Act
                session.end();

                // Assert
                expect(fakeTraceSpan.endSpan).toHaveBeenCalled();
            });
        });
    });
});
