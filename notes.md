remain open to everyone, including anonymous users.

- GET ALL ("/") companies

  - Company.findAll
  - Company.getFiltered

- GET ONE ("/:handle") company
  - Company.get

only be possible for users who logged in with an account that has the is_admin flag in the database.

- PATCH ("/:handle") DONE

  - Company.update

- POST ("/") DONE

  - Company.create

- DELETE ("/:handle") DONE
  - Company.remove

On every request,

- authenticateJWT

is_admin
users

should be allowed either by admin or by user himself
getting information of user,
updating user,
deleting user



---------------------------------

