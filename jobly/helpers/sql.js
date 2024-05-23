import { BadRequestError } from "../expressError.js";

/**
 * Intake as the first arg as an object w/ properties that the user wishes
 * to update
 *
 * Intake as the second arg an object w/ properties that we allow for update,
 * where the data param keys are in camelCase but the db naming is in snake_case
 *
 * EX INPUT:
 *    { firstName, lastName, password, email },
 *    {
 *      firstName: "first_name",
 *      lastName: "last_name",
 *      isAdmin: "is_admin",
 *     }
 *
 * Outputs an object that has a setColumn key which has as a pre-written
 * string to assign snake_case column names to variable index, and a values
 * key with an array of corresponding values that the user wishes to update
 *
 * EX OUTPUT:
 *    {
 *      setCols: 'first_name=$1, last_name=$2, password=$3, email=$4'
 *      values: { first_name, last_name, password, email }
 *    }
 *
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}




export { sqlForPartialUpdate };
