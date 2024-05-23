import { describe, test, expect } from "vitest";
import jwt from "jsonwebtoken";

import { UnauthorizedError } from "../expressError.js";
import {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureUserAccess
} from "./auth.js";
import { SECRET_KEY } from "../config.js";

const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const adminTestJWT = jwt.sign({ username: "test", isAdmin: true }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false }, "wrong");

function next(err) {
  if (err) throw new Error("Got error from middleware");
}

describe("authenticateJWT", function () {
  test("works: via header", function () {
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: "test",
        isAdmin: false,
      },
    });
  });

  test("works: no header", function () {
    const req = {};
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function () {
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});


describe("ensureLoggedIn", function () {
  test("works", function () {
    const req = {};
    const res = { locals: { user: { username: "test" } } };
    ensureLoggedIn(req, res, next);
  });

  test("unauth if no login", function () {
    const req = {};
    const res = { locals: {} };
    expect(() => ensureLoggedIn(req, res, next))
      .toThrow(UnauthorizedError);
  });

  test("unauth if no valid login", function () {
    const req = {};
    const res = { locals: { user: {} } };
    expect(() => ensureLoggedIn(req, res, next))
      .toThrow(UnauthorizedError);
  });
});

describe("ensureAdmin", function () { // TODO: add if isAdmin is a string of yes, but not a boolean
  test("works", function () {
    const req = {};
    const res = { locals: { user: { isAdmin: true } } };
    ensureAdmin(req, res, next);
  });

  test("unauth if not an admin", function () {
    const req = {};
    const res = { locals: { user: { isAdmin: false } } };
    expect(() => ensureAdmin(req, res, next))
      .toThrow(UnauthorizedError);
  });

  test("unauth if user empty", function () {
    const req = {};
    const res = { locals: { user: {} } };
    expect(() => ensureAdmin(req, res, next))
      .toThrow(UnauthorizedError);
  });
});


describe("ensureUserAccess", function () {
  test("works because current user is accessing route", function () {
    const req = { params: { username: 'test1' } };
    const res = { locals: { user: { username: 'test1' } } };
    ensureUserAccess(req, res, next);
  });

  test("works because user is admin", function () {
    const req = {};
    const res = { locals: { user: { isAdmin: true } } };
    ensureUserAccess(req, res, next);
  });

  test("works if current user is accessing route and is admin", function () {
    const req = { params: { username: 'test1' } };
    const res = { locals: { user: { username: 'test1', isAdmin: true } } };
    ensureUserAccess(req, res, next);
  });

  test("unauth if not admin and not correct user", function () {
    const req = { params: { username: 'test2' } };
    const res = { locals: { user: { username: 'test1' } } };
    expect(() => ensureUserAccess(req, res, next))
      .toThrow(UnauthorizedError);
  });

  test("unauth if anon", function () {
    const req = {};
    const res = { locals: { user: {} } };
    expect(() => ensureUserAccess(req, res, next))
      .toThrow(UnauthorizedError);
  });
});