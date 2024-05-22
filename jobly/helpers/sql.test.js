import { describe, test, expect } from "vitest";
import { sqlForPartialUpdate } from "./sql.js";



describe("sqlForPartialUpdate", function () {
  test("works: data passed in", function () {
    const results = sqlForPartialUpdate(
      {
        firstName: "Jane",
        lastName: "Austen",
        password: "JA1",
        email: "ja@gmail.com"
      }, {
      firstName: "first_name",
      lastName: "last_name",
      isAdmin: "is_admin",
    });

    expect(results).toEqual({
      setCols:
        "\"first_name\"=$1, \"last_name\"=$2, \"password\"=$3, \"email\"=$4",
      values:
        ["Jane", "Austen", "JA1", "ja@gmail.com"]
    });
  });

  test("error: data not passed in", function () {

    expect(() => sqlForPartialUpdate(
      {}, {
      firstName: "first_name",
      lastName: "last_name",
      isAdmin: "is_admin",
    })).toThrowError(/No data/);

  });

});