import bcrypt from "bcrypt";

import db from "../db.js";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../expressError.js";


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
  *       midSalary: INTEGER returns >minSalary,
  *       hasEquity: BOOLEAN
  *       }
  *
  * Outpus:
  *     [{ id, title, salary, equity, company_handle }, ...]
  *
  **/




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





  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *    { title, salary, equity }
   *
   * Outputs:
   *    { id, title, salary, equity, company_handle }
   *
   * Throws NotFoundError if not found.
   **/

  /** Delete given job from database; returns undefined. */

}

export default Job;