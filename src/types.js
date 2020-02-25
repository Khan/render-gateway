// @flow
export type AuthenticationOptions = {
    secretKey: string,
    headerName: string,
    cryptoKeyPath: string,
};

export type RenderGatewayOptions = {
    name: string,
    port: number,
    authentication?: AuthenticationOptions,
};
