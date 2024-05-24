import bcrypt from "bcrypt";

import db from "../db.js";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../expressError.js";
import { sqlForPartialUpdate } from "../helpers/sql.js";



/** Related functions for jobs. */

class Job {

  /** Create a job with the data given.
   *
   * Input:
   *    {title: TEXT
   *      salary: INTEGER CHECK (salary >= 0),
   *      equity: NUMERIC CHECK (equity <= 1.0),
   *      companyHandle: VARCHAR(25)}
   *
   * Output:
   *    { id, title, salary, equity, company_handle }
   **/
  static async create({ title, salary, equity, companyHandle }) {

    const result = await db.query(`
                INSERT INTO jobs (title,
                                       salary,
                                       equity,
                                       company_handle)
                VALUES ($1, $2, $3, $4)
                RETURNING
                    id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"`,
      [
        title,
        salary,
        equity,
        companyHandle
      ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs with or without filters.
  *
  * Input (optional):
  *     { title: STRING case-insensitive,
  *       minSalary: INTEGER returns >minSalary,
  *       hasEquity: BOOLEAN
  *       }
  *
  * Outpus:
  *     [{ id, title, salary, equity, company_handle }, ...]
  *
  * Throw NotFoundError if no jobs found that match the filters
  *
  **/
  static async findAllWithFilters(filters = {}) {

    const whereClause = this.whereClauseInsert(filters);

    const results = await db.query(`
        SELECT id,
               title,
               salary,
               equity,
               company_handle AS "companyHandle"
        FROM jobs
        WHERE ${whereClause}
        ORDER BY id`
    );

    return results.rows;
  }

  /** Given a job id, return data about job.
   *
   * Param accepted:
   *    "/id: num"
   *
   * Outputs
   *    { id, title, salary, equity, company_handle }
   *
   * Throws NotFoundError if job not found.
   **/
  static async get(jobId) {
    const jobResults = await db.query(`
        SELECT id,
               title,
               salary,
               equity,
               company_handle AS "companyHandle"
        FROM jobs
        WHERE id = $1`, [jobId]);

    const job = jobResults.rows[0];

    if (!job) throw new NotFoundError(`No company: ${jobId}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Id is an INTEGER
   *
   * Data can include:
   *    { title, salary, equity }
   *
   * Outputs:
   *    { id, title, salary, equity, company_handle }
   *
   * Throws NotFoundError if not found.
   **/
  static async update(jobId, data) {

    const { setCols, values } = sqlForPartialUpdate(
      data,
      {});

    const querySql = `
        UPDATE jobs
        SET ${setCols}
        WHERE id = ${jobId}
        RETURNING
            id,
            title,
            salary,
            equity,
            company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${jobId}`);

    return job;

  }

  /** Delete given job from database; returns undefined. */
  static async remove(jobId) {
    const result = await db.query(`
        DELETE
        FROM jobs
        WHERE id = $1
        RETURNING id`, [jobId]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No job with id: ${jobId}`);
  }


  /** Intake an object w/ properties for a where clause
   * Outputs a string to be inserted into a WHERE clause
   *
   * EX INPUT:
   *  { title: STRING, minSalary: INTEGER, hasEquity: BOOLEAN }
   *
   * EX OUTPUT:
   *  `title LIKE '%title%' AND salary >= minSalary AND equity > / = 0`
   *
   **/
  static whereClauseInsert(filtersData) {

    const filtersKeys = Object.keys(filtersData);

    if (filtersKeys.length === 0) return `id > 0`;

    const whereClauseInsert = filtersKeys.map((filterKey) => {
      if (filterKey === "title") {
        return `title LIKE '%${filtersData[filterKey]}%'`;
      }
      if (filterKey === "minSalary") {
        return `salary >= ${filtersData[filterKey]}`;
      }
      if (filtersData[filterKey] === true) {
        return `equity > 0`;
      } else if (filtersData[filterKey] === false) {
        return `equity = 0`;
      }
    }
    );

    return whereClauseInsert.join(" AND ");
  }
}

export default Job;