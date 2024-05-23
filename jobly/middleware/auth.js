/** Convenience middleware to handle common auth cases in routes. */

import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config.js";
import { UnauthorizedError } from "../expressError.js";


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  const authHeader = req.headers?.authorization;
  if (authHeader) {
    const token = authHeader.replace(/^[Bb]earer /, "").trim();

    try {
      res.locals.user = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      /* ignore invalid tokens (but don't store user!) */
    }
  }
  return next();

}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  // console.log("USER INSTANCE", res.locals.user);
  if (res.locals.user?.username) return next();
  throw new UnauthorizedError();
}

/** Middleware to use that the user must be an admin.
 *
 * If not, raises Unauthorized.
 */

function ensureAdmin(req, res, next) {
  console.log('ensureAdmin ran', res.locals.user?.isAdmin);

  if (res.locals.user?.isAdmin) return next();
  throw new UnauthorizedError();
}

/** Middleware to use when checking if user has permissions to make changes to data
 *
 * If not, raises Unauthorized.
 */

function ensureUserAccess(req, res, next) {
  console.log('ensureUserAccess ran', req.params);

  const userRoute = req.params?.username;
  const currentUser = res.locals.user?.username;

  const userMatchAndValid =
    (userRoute === currentUser)
    && (currentUser !== undefined && currentUser !== undefined);

  if (res.locals.user?.isAdmin || userMatchAndValid) {
    return next();
  }
  throw new UnauthorizedError();
}


export {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureUserAccess
};
