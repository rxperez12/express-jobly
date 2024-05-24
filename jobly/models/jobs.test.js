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

    expect(job).toEqual(
      {
        id: 4,
        title: "new job4",
        salary: 75000,
        equity: '0.1',
        companyHandle: "c3"
      });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
       FROM jobs
       WHERE title = 'new job4'`);

    expect(result.rows).toEqual([
      {
        id: 4,
        title: "new job4",
        salary: 75000,
        equity: '0.1',
        companyHandle: "c3",
      },
    ]);
  });
});

/************************************** whereClauseInsert */

describe("generate where conditions for findAllWithFilters sql", function () {

  test("ok: 0 filter passed in", async function () {
    let conditions = Job.whereClauseInsert({});
    expect(conditions).toEqual(`id > 0`);
  });

  test("ok: 1 filter passed in", async function () {
    let conditions = Job.whereClauseInsert({ title: "job1" });
    expect(conditions).toEqual(`title LIKE '%job1%'`);
  });

  test("ok: 2 filter passed in", async function () {
    let conditions = Job.whereClauseInsert({
      title: "job1",
      minSalary: 100000
    });
    expect(conditions).toEqual(`title LIKE '%job1%' AND salary >= 100000`);
  });

  test("ok: 3 filter passed in", async function () {
    let conditions = Job.whereClauseInsert({
      title: "job",
      minSalary: 1000,
      hasEquity: true
    });
    expect(conditions).toEqual(
      `title LIKE '%job%' AND salary >= 1000 AND equity > 0`
    );
  });
});

/************************************** findAllWithFilters */

describe("find all with optional filters", function () {

  test("ok: no filter passed in", async function () {
    let jobs = await Job.findAllWithFilters();
    expect(jobs).toEqual(
      [{
        id: 1,
        title: "job1",
        salary: 200000,
        equity: '0',
        companyHandle: "c1"
      },
      {
        id: 2,
        title: "job2",
        salary: 100000,
        equity: '0.5',
        companyHandle: "c1"
      },
      {
        id: 3,
        title: "job3",
        salary: 50000,
        equity: '1',
        companyHandle: "c2"
      }]);
  });

  test("ok: 1 filter passed in", async function () {
    let jobs = await Job.findAllWithFilters({ title: "job1" });
    expect(jobs).toEqual(
      [{
        id: 1,
        title: "job1",
        salary: 200000,
        equity: '0',
        companyHandle: "c1"
      }]);
  });

  test("ok: 2 filters passed in", async function () {
    let jobs = await Job.findAllWithFilters({
      title: "job",
      minSalary: 100000
    });

    expect(jobs).toEqual(
      [{
        id: 1,
        title: "job1",
        salary: 200000,
        equity: '0',
        companyHandle: "c1"
      },
      {
        id: 2,
        title: "job2",
        salary: 100000,
        equity: '0.5',
        companyHandle: "c1"
      }]);
  });

  test("ok: 3 filters passed in", async function () {
    let jobs = await Job.findAllWithFilters({
      title: "job",
      minSalary: 1000,
      hasEquity: true
    });

    expect(jobs).toEqual(
      [{
        id: 2,
        title: "job2",
        salary: 100000,
        equity: '0.5',
        companyHandle: "c1"
      },
      {
        id: 3,
        title: "job3",
        salary: 50000,
        equity: '1',
        companyHandle: "c2"
      }]);
  });

  test("error: no job found", async function () {
    let jobs = await Job.findAllWithFilters({
      title: "no such job",
      minSalary: 100000000
    });
    expect(jobs).toEqual(
      []);
  });
});

/************************************** getOne */

describe("get job by ID", function () {

  test("works", async function () {
    let job = await Job.get(1);
    expect(job).toEqual(
      {
        id: 1,
        title: "job1",
        salary: 200000,
        equity: '0',
        companyHandle: "c1",
      }
    );
  });

  test("not found if no such company", async function () {
    try {
      await Job.get(5);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      console.log(err);
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */




/************************************** delete */
