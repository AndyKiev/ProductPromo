"""Resolve the user's display language to a reference-table Name* suffix.

Reference tables carry NameR / NameU / NameE / NameF. We keep only ukr/eng,
so the user's language maps to `name_u` (Ukrainian) or `name_e` (English),
with English as the safe fallback. Point `lang_suffix_for` at whatever field
on your employee/person card carries the language acronym ("ukr"/"eng").
"""
_UKR = {"ukr", "ua", "uk", "u"}


def lang_suffix_for(user) -> str:
    acronym = (
        getattr(user, "lang_acronym", None)
        or getattr(getattr(user, "lang", None), "short_name", None)
        or getattr(getattr(user, "lang", None), "acronym", None)
        or ""
    )
    return "u" if str(acronym).lower() in _UKR else "e"


def localized_name(obj, suffix: str):
    """Pick name_<suffix> off a reference row, falling back to English then Ukr."""
    if obj is None:
        return None
    return (
        getattr(obj, f"name_{suffix}", None)
        or getattr(obj, "name_e", None)
        or getattr(obj, "name_u", None)
    )
