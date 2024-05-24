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
   *      company_handle: VARCHAR(25)}
   *
   * Output:
   *    { id, title, salary, equity, company_handle }
   **/




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