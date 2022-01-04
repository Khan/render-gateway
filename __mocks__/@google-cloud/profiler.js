// The logging in @google-cloud/profiler can lead to an async request that
// may finish after the test is run and log an error. This is annoying
// and the only way I have found around it is to do this manual mock.
export const start = jest.fn();
