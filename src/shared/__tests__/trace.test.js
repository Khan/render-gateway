// @flow
import * as GetGatewayInfo from "../get-gateway-info.js";
import {trace} from "../trace.js";

jest.mock("../get-gateway-info.js");

describe("#trace", () => {
    it.each([[""], [null], [undefined]])(
        "should throw if the action is empty/falsy",
        (testPoint) => {
            // Arrange
            const fakeLogger = ({}: any);
            jest.spyOn(GetGatewayInfo, "getGatewayInfo").mockReturnValue({
                name: "GATEWAY_NAME",
                version: "GATEWAY_VERSION",
            });

            // Act
            const underTest = () => trace(fakeLogger, testPoint, "MESSAGE");

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
        jest.spyOn(GetGatewayInfo, "getGatewayInfo").mockReturnValue({
            name: "GATEWAY_NAME",
            version: "GATEWAY_VERSION",
        });

        // Act
        trace(fakeLogger, "ACTION", "MESSAGE");

        // Assert
        expect(fakeLogger.silly).toHaveBeenCalledWith("TRACE ACTION: MESSAGE");
    });

    it("should start a timer", () => {
        // Arrange
        const fakeLogger = ({
            silly: jest.fn(),
            startTimer: jest.fn(),
        }: any);
        jest.spyOn(GetGatewayInfo, "getGatewayInfo").mockReturnValue({
            name: "GATEWAY_NAME",
            version: "GATEWAY_VERSION",
        });

        // Act
        trace(fakeLogger, "ACTION", "MESSAGE");

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
        jest.spyOn(GetGatewayInfo, "getGatewayInfo").mockReturnValue({
            name: "GATEWAY_NAME",
            version: "GATEWAY_VERSION",
        });

        // Act
        trace(fakeLogger, "ACTION", "MESSAGE", fakeTracer);

        // Assert
        expect(fakeTracer.createChildSpan).toHaveBeenCalledWith({
            name: "GATEWAY_NAME.ACTION",
        });
    });

    it("should return a trace session", () => {
        // Arrange
        const fakeLogger: any = {
            silly: jest.fn(),
            startTimer: jest.fn(),
        };
        jest.spyOn(GetGatewayInfo, "getGatewayInfo").mockReturnValue({
            name: "GATEWAY_NAME",
            version: "GATEWAY_VERSION",
        });

        // Act
        const result = trace(fakeLogger, "ACTION", "MESSAGE");

        // Assert
        expect(result).toBeDefined();
    });

    describe("trace session", () => {
        describe("#action", () => {
            it("should give action of the trace", () => {
                // Arrange
                const fakeLogger: any = {
                    silly: jest.fn(),
                    startTimer: jest.fn(),
                };
                jest.spyOn(GetGatewayInfo, "getGatewayInfo").mockReturnValue({
                    name: "GATEWAY_NAME",
                    version: "GATEWAY_VERSION",
                });
                const session = trace(fakeLogger, "ACTION", "MESSAGE");

                // Act
                const result = session.action;

                // Assert
                expect(result).toBe("ACTION");
            });

            it("should be read-only", () => {
                // Arrange
                const fakeLogger: any = {
                    silly: jest.fn(),
                    startTimer: jest.fn(),
                };
                jest.spyOn(GetGatewayInfo, "getGatewayInfo").mockReturnValue({
                    name: "GATEWAY_NAME",
                    version: "GATEWAY_VERSION",
                });
                const session = trace(fakeLogger, "ACTION", "MESSAGE");

                // Act
                /**
                 * Flow is going to complain because name is readonly.
                 * We will suppress this because we want to test that runtime
                 * code is enforcing this. The idea of this test is to ensure
                 * that folks don't edit out this specific behavior.
                 * $ExpectError
                 */
                const underTest = () => (session.action = "NEW_ACTION!");

                // Assert
                expect(underTest).toThrowErrorMatchingInlineSnapshot(
                    `"Cannot set property action of #<Object> which has only a getter"`,
                );
            });
        });

        describe("#addLabel", () => {
            it("should add the label to the span", () => {});
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
                jest.spyOn(process, "memoryUsage")
                    .mockReturnValueOnce("BEFORE")
                    .mockReturnValueOnce("AFTER");
                jest.spyOn(GetGatewayInfo, "getGatewayInfo").mockReturnValue({
                    name: "GATEWAY_NAME",
                    version: "GATEWAY_VERSION",
                });
                const session = trace(fakeLogger, "ACTION", "MESSAGE");

                // Act
                session.end();

                // Assert
                expect(fakeTimer.done).toHaveBeenCalledWith({
                    message: "TRACED ACTION: MESSAGE",
                    level: "debug",
                    memoryAfter: "AFTER",
                    memoryBefore: "BEFORE",
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
                jest.spyOn(process, "memoryUsage")
                    .mockReturnValueOnce("BEFORE")
                    .mockReturnValueOnce("AFTER");
                jest.spyOn(GetGatewayInfo, "getGatewayInfo").mockReturnValue({
                    name: "GATEWAY_NAME",
                    version: "GATEWAY_VERSION",
                });
                const session = trace(fakeLogger, "ACTION", "MESSAGE");

                // Act
                session.end({level: "silly"});

                // Assert
                expect(fakeTimer.done).toHaveBeenCalledWith({
                    message: "TRACED ACTION: MESSAGE",
                    level: "silly",
                    memoryAfter: "AFTER",
                    memoryBefore: "BEFORE",
                });
            });

            it("should add labels to metadata", () => {
                // Arrange
                const fakeTimer = {
                    done: jest.fn(),
                };
                const fakeLogger: any = {
                    silly: jest.fn(),
                    startTimer: jest.fn().mockReturnValue(fakeTimer),
                };
                jest.spyOn(process, "memoryUsage")
                    .mockReturnValueOnce("BEFORE")
                    .mockReturnValueOnce("AFTER");
                jest.spyOn(GetGatewayInfo, "getGatewayInfo").mockReturnValue({
                    name: "GATEWAY_NAME",
                    version: "GATEWAY_VERSION",
                });
                const session = trace(fakeLogger, "ACTION", "MESSAGE");
                session.addLabel("LABEL_A", "label_a");
                session.addLabel("/label/b", "label_b");

                // Act
                session.end();

                // Assert
                expect(fakeTimer.done).toHaveBeenCalledWith({
                    message: "TRACED ACTION: MESSAGE",
                    level: "debug",
                    memoryAfter: "AFTER",
                    memoryBefore: "BEFORE",
                    LABEL_A: "label_a",
                    "/label/b": "label_b",
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
                jest.spyOn(process, "memoryUsage")
                    .mockReturnValueOnce("BEFORE")
                    .mockReturnValueOnce("AFTER");
                jest.spyOn(GetGatewayInfo, "getGatewayInfo").mockReturnValue({
                    name: "GATEWAY_NAME",
                    version: "GATEWAY_VERSION",
                });
                const session = trace(fakeLogger, "ACTION", "MESSAGE");

                // Act
                session.end({
                    cached: true,
                    size: 56,
                    someotherrubbish: "blahblahblah",
                });

                // Assert
                expect(fakeTimer.done).toHaveBeenCalledWith({
                    message: "TRACED ACTION: MESSAGE",
                    level: "debug",
                    cached: true,
                    size: 56,
                    someotherrubbish: "blahblahblah",
                    memoryAfter: "AFTER",
                    memoryBefore: "BEFORE",
                });
            });

            it("should override labels with metadata", () => {
                // Arrange
                const fakeTimer = {
                    done: jest.fn(),
                };
                const fakeLogger: any = {
                    silly: jest.fn(),
                    startTimer: jest.fn().mockReturnValue(fakeTimer),
                };
                jest.spyOn(process, "memoryUsage")
                    .mockReturnValueOnce("BEFORE")
                    .mockReturnValueOnce("AFTER");
                jest.spyOn(GetGatewayInfo, "getGatewayInfo").mockReturnValue({
                    name: "GATEWAY_NAME",
                    version: "GATEWAY_VERSION",
                });
                const session = trace(fakeLogger, "ACTION", "MESSAGE");
                session.addLabel("cached", false);
                session.addLabel("/label/b", "label_b");

                // Act
                session.end({
                    cached: true,
                    size: 56,
                    someotherrubbish: "blahblahblah",
                });

                // Assert
                expect(fakeTimer.done).toHaveBeenCalledWith({
                    message: "TRACED ACTION: MESSAGE",
                    level: "debug",
                    cached: true,
                    size: 56,
                    someotherrubbish: "blahblahblah",
                    memoryAfter: "AFTER",
                    memoryBefore: "BEFORE",
                    "/label/b": "label_b",
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
                jest.spyOn(process, "memoryUsage")
                    .mockReturnValueOnce("BEFORE")
                    .mockReturnValueOnce("AFTER");
                jest.spyOn(GetGatewayInfo, "getGatewayInfo").mockReturnValue({
                    name: "GATEWAY_NAME",
                    version: "GATEWAY_VERSION",
                });
                const session = trace(fakeLogger, "ACTION", "MESSAGE");

                // Act
                session.end({
                    message: "I secretly want to change the message",
                });

                // Assert
                expect(fakeTimer.done).toHaveBeenCalledWith({
                    message: "TRACED ACTION: MESSAGE",
                    level: "debug",
                    memoryAfter: "AFTER",
                    memoryBefore: "BEFORE",
                });
            });

            it("should end the trace span", () => {
                // Arrange
                const fakeTraceSpan = {
                    addLabel: jest.fn(),
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
                jest.spyOn(GetGatewayInfo, "getGatewayInfo").mockReturnValue({
                    name: "GATEWAY_NAME",
                    version: "GATEWAY_VERSION",
                });
                const session = trace(
                    fakeLogger,
                    "ACTION",
                    "MESSAGE",
                    fakeTracer,
                );

                // Act
                session.end();

                // Assert
                expect(fakeTraceSpan.endSpan).toHaveBeenCalled();
            });
        });
    });
});
