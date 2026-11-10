# auth

This app logs its users in itself; see `jwt_auth.py` and the "Auth" section of the repo's `AGENTS.md`.
The endpoints, LDAP check and token handling come from `pp_common.auth`; `keys/` holds this app's RS256
pair (created once by `generate_keys.sh`, git-ignored).
