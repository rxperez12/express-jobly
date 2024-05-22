/** Routes for companies. */

import jsonschema from "jsonschema";
import { Router } from "express";

import { BadRequestError } from "../expressError.js";
import { ensureLoggedIn } from "../middleware/auth.js";
import Company from "../models/company.js";
import compNewSchema from "../schemas/compNew.json" with { type: "json" };
import compUpdateSchema from "../schemas/compUpdate.json" with { type: "json" };
import compGetFilter from "../schemas/compGetFilter.json" with { type: "json" };

const router = new Router();


/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login
 */

router.post("/", ensureLoggedIn, async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    compNewSchema,
    { required: true },
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const company = await Company.create(req.body);
  return res.status(201).json({ company });
});

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  //Check if body has values to filter with
  //If if so, validate body
  //Throw error if body is invalid,
  //return filtered data
  //If no body, then return all companies
  const minEmployees = Number(req.params?.minEmployees);
  const maxEmployees = Number(req.params?.maxEmployees);
  const nameLike = req.params?.nameLike;

  let companies;
  if (!Number.isNaN(minEmployees)
    || !Number.isNaN(maxEmployees)
    || nameLike !== undefined) {
    const validator = jsonschema.validate(
      {
        minEmployees: minEmployees,
        maxEmployees: maxEmployees,
        nameLike: nameLike
      }
      ,
      compGetFilter.json,
      { required: true },
    );

    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    if ((minEmployees !== undefined && maxEmployees !== undefined)
      && (minEmployees > maxEmployees)) {
      throw new BadRequestError('Min employees cannot be greater than max employees');
    }

    companies = await Company.findFiltered(req.body); //TODO: placeholder function
  }

  companies = await Company.findAll();
  return res.json({ companies });
});

/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

router.get("/:handle", async function (req, res, next) {
  const company = await Company.get(req.params.handle);
  return res.json({ company });
});

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: login
 */

router.patch("/:handle", ensureLoggedIn, async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    compUpdateSchema,
    { required: true },
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const company = await Company.update(req.params.handle, req.body);
  return res.json({ company });
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login
 */

router.delete("/:handle", ensureLoggedIn, async function (req, res, next) {
  await Company.remove(req.params.handle);
  return res.json({ deleted: req.params.handle });
});


export default router;
