import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "vitest";

import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../expressError.js";
import db from "../db.js";
import Job from "./jobs.js";
import {
  commonAfterAll,
  commonAfterEach,
  commonBeforeAll,
  commonBeforeEach,
} from "./_testCommon.js";

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/************************************** create */

describe("create", function () {
  const newJob = {
    title: "new job4",
    salary: 75000,
    equity: 0.1,
    companyHandle: "c3",
  };

  test("ok: creates a job", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual(newJob);

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
       FROM jobs
       WHERE title = 'new job4'`);
    expect(result.rows).toEqual([
      {
        id: 4,
        title: "new job4",
        salary: 75000,
        equity: 0.1,
        companyHandle: "c3",
      },
    ]);
  });
});


/************************************** findAll */

/************************************** getOne */

/************************************** update */

/************************************** delete */
