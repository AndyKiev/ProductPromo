"""Resolve the user's display language to a reference-table Name* suffix.

Reference tables carry NameR / NameU / NameE / NameF. The profile's dynamic
lang_id resolves to a language record; its short_name selects the legacy
name column. Application status labels use the translation catalog.
"""
_UKR = {"ukr", "ua", "uk", "u"}
_RUS = {"rus", "ru", "r"}


def lang_suffix_for(user) -> str:
    acronym = (
        getattr(user, "lang_acronym", None)
        or getattr(getattr(user, "lang", None), "short_name", None)
        or getattr(getattr(user, "lang", None), "acronym", None)
        or ""
    )
    code = str(acronym).lower()
    return "r" if code in _RUS else "u" if code in _UKR else "e"


def localized_name(obj, suffix: str):
    """Pick name_<suffix> off a reference row, falling back to English then Ukr."""
    if obj is None:
        return None
    if getattr(obj, "code", None) in {"active", "inactive"}:
        from backend.api_v1.msg.catalog import catalog_cache
        catalog = catalog_cache.snapshot
        code = {"r": "rus", "u": "ukr", "e": "eng"}.get(suffix, "eng")
        lang_id = next((id_ for id_, lang in catalog.languages.items() if lang.short_name == code), catalog.default_id)
        return catalog.text(obj.code, lang_id)
    return (
        getattr(obj, f"name_{suffix}", None)
        or getattr(obj, "name_e", None)
        or getattr(obj, "name_u", None)
    )
