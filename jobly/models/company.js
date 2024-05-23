import db from "../db.js";
import { BadRequestError, NotFoundError } from "../expressError.js";
import { sqlForPartialUpdate } from "../helpers/sql.js";

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(`
        SELECT handle
        FROM companies
        WHERE handle = $1`, [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(`
                INSERT INTO companies (handle,
                                       name,
                                       description,
                                       num_employees,
                                       logo_url)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING
                    handle,
                    name,
                    description,
                    num_employees AS "numEmployees",
                    logo_url AS "logoUrl"`, [
      handle,
      name,
      description,
      numEmployees,
      logoUrl,
    ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll() {
    const companiesRes = await db.query(`
        SELECT handle,
               name,
               description,
               num_employees AS "numEmployees",
               logo_url      AS "logoUrl"
        FROM companies
        ORDER BY name`);
    return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(`
        SELECT handle,
               name,
               description,
               num_employees AS "numEmployees",
               logo_url      AS "logoUrl"
        FROM companies
        WHERE handle = $1`, [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /**
   * Take in object with optional keys minEmployees, maxEmployees, and nameLike.
   * Using filters, return data of companies that match filter(s).
   *
   * Input:
   * {
   *  nameLike: 'str' case insenstive,
   *  minEmployees: num, must be less than maxEmployee key
   *  maxEmployees: num, must be greater than minEmployee key
   * }
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   */
  static async getFiltered(filters) {
    const { whereClause, values } = this.sqlForFilterConditions(filters);

    const querySql = `
    SELECT
        handle,
        name,
        description,
        num_employees AS "numEmployees",
        logo_url AS "logoUrl"
    FROM companies
    WHERE ${whereClause}`;
    const result = await db.query(querySql, [...values]);

    const companies = result.rows;

    return companies;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        numEmployees: "num_employees",
        logoUrl: "logo_url",
      });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `
        UPDATE companies
        SET ${setCols}
        WHERE handle = ${handleVarIdx}
        RETURNING
            handle,
            name,
            description,
            num_employees AS "numEmployees",
            logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(`
        DELETE
        FROM companies
        WHERE handle = $1
        RETURNING handle`, [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }


  /**
 * Intake as the first arg as an object w/ properties for a where clause
 * Outputs an object with 1 property for the WHERE clause string and a
 * property for the corresponding key values
 *
 * EX INPUT:
 *    { minEmployees:1, maxEmployees:2 }
 *
 * EX OUTPUT:
 *    {
 *        whereClause: num_employees >=1 AND num_employees <=2,
 *        values: [1, 2]
 *     };
 *
 */
  static sqlForFilterConditions(dataToFilter) {
    const keys = Object.keys(dataToFilter);
    if (keys.length === 0) throw new BadRequestError("No data");

    const partialClauses = keys.map((colName, idx) => {
      if (colName === "nameLike") {
        dataToFilter["nameLike"] = `%${dataToFilter["nameLike"]}%`;
        return `name ILIKE $${idx + 1}`;
      }
      if (colName === "minEmployees") {
        return `num_employees >= $${idx + 1}`;
      }
      if (colName === "maxEmployees") {
        return `num_employees <= $${idx + 1}`;
      }
    }
    );

    return {
      whereClause: partialClauses.join(" AND "),
      values: Object.values(dataToFilter),
    };
  }
}


export default Company;