remain open to everyone, including anonymous users.
* GET ALL ("/") companies
    * Company.findAll
    * Company.getFiltered

* GET ONE ("/:handle") company
    * Company.get


only be possible for users who logged in with an account that has the is_admin flag in the database.

* PATCH ("/:handle")
    * Company.update

* POST ("/")
    * Company.create

* DELETE ("/:handle")
    * Company.remove



On every request,
* authenticateJWT