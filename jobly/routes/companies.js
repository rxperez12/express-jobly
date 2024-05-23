/** Routes for companies. */

import jsonschema from "jsonschema";
import { Router } from "express";

import { BadRequestError } from "../expressError.js";
import { ensureLoggedIn, ensureAdmin } from "../middleware/auth.js";
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
 * Authorization required: login, isAdmin
 */

router.post("/", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
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

  const userInput = {};

  for (const key of ["minEmployees", "maxEmployees", "nameLike"]) {
    if (req.query[key] !== undefined) {
      if (key === "maxEmployees" || key === "minEmployees") {
        userInput[key] = Number(req.query[key]);
      } else {
        userInput[key] = req.query[key];
      }
    }
  }

  let companies;

  if (userInput.minEmployees === undefined
    && userInput.maxEmployees === undefined
    && userInput.nameLike === undefined) {
    companies = await Company.findAll();
    return res.json({ companies });
  }

  const validator = jsonschema.validate(
    userInput,
    compGetFilter,
    { required: false },
  );

  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  if ((userInput.minEmployees !== undefined // TODO: This validation could get moved to the model method
    && userInput.maxEmployees !== undefined)
    && (userInput.minEmployees > userInput.maxEmployees)) {
    throw new BadRequestError('Min employees cannot be greater than max employees');
  }

  companies = await Company.getFiltered(userInput);
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
 * Authorization required: login, isAdmin
 */

router.patch("/:handle", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
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
 * Authorization: login, isAdmin
 */

router.delete("/:handle", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  await Company.remove(req.params.handle);
  return res.json({ deleted: req.params.handle });
});


export default router;
