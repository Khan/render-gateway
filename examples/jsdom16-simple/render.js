// @flow
window["__jsdom_env_register"](() => {
    // This is where we can return our result.
    return Promise.resolve({
        body: `You asked us to render ${window._API.url} with JSDOM 16`,
        status: 200,
        headers: {},
    });
});
