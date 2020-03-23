// @flow
import type {Middleware, $Request, $Response, NextFunction} from "express";
import {getRuntimeMode} from "../../ka-shared/index.js";
import {getSecrets} from "../get-secrets.js";

import type {AuthenticationOptions} from "../types.js";

async function makeProductionMiddleware<Req: $Request, Res: $Response>(
    options: AuthenticationOptions,
): Promise<Middleware<Req, Res>> {
    /**
     * We look up the secret when the middleware is created. That means
     * that if the secret changes, the server needs to be
     * restarted/refreshed somehow.
     *
     * TODO(somewhatabstract, WEB-1410): Add ability to trigger refresh of
     * server - likely just a killswitch to kill an instance so that GAE spins
     * up new ones.
     */
    const {secretKey, headerName, cryptoKeyPath} = options;
    const secrets = await getSecrets(cryptoKeyPath);
    const secret = secrets[secretKey];
    if (secret == null) {
        throw new Error("Unable to load secret");
    }

    return function (req: Req, res: Res, next: NextFunction): void {
        const requestSecret = req.header(headerName);
        if (requestSecret !== secret) {
            res.status(401).send({error: "Missing or invalid secret"});
            return;
        }

        next();
    };
}

function makeDevelopmentMiddleware<Req: $Request, Res: $Response>(): Promise<
    Middleware<Req, Res>,
> {
    /**
     * The secrets middleware is a noop when not in production.
     */
    return Promise.resolve(function (
        req: Req,
        res: Res,
        next: NextFunction,
    ): void {
        next();
    });
}

/**
 * Make the middleware to verify a request's authentication secret.
 *
 * This is a noop when not in production, otherwise this loads the appropriate
 * secret as identified by the options and then uses the configured header name
 * to identify the request header that it is to be matched against.
 */
export function makeCheckSecretMiddleware<Req: $Request, Res: $Response>(
    authenticationOptions?: AuthenticationOptions,
): Promise<Middleware<Req, Res>> {
    if (authenticationOptions != null && getRuntimeMode() === "production") {
        return makeProductionMiddleware(authenticationOptions);
    }

    return makeDevelopmentMiddleware();
}
