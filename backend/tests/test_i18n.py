"""Contract tests for THIS service's translations. The catalog engine itself
(fallback chain, substitution, cache) is tested in pp-common."""
import re
import unittest

from pp_common.i18n import Catalog, LangRead, get_catalog_cache

from backend.api_v1.msg.catalog import FALLBACKS, catalog_cache


class TranslationContractTests(unittest.TestCase):
    def test_every_key_has_both_languages_and_matching_parameters(self):
        self.assertGreater(len(FALLBACKS), 250)
        for key, values in FALLBACKS.items():
            with self.subTest(key=key):
                self.assertEqual(set(values), {"eng", "rus"})
                self.assertTrue(values["eng"] and values["rus"])
                self.assertEqual(set(re.findall(r"\$\{(\w+)\}", values["eng"])),
                                 set(re.findall(r"\$\{(\w+)\}", values["rus"])))

    def test_domain_messages_are_collected_and_resolve_in_russian(self):
        catalog = Catalog(languages={93: LangRead(id=93, short_name="rus", name="Русский", locale="ru")},
                          fallbacks=FALLBACKS)
        self.assertEqual(catalog.text("categoryNotFound", 93, {"id": 17}), "Категория с ID 17 не найдена")
        self.assertEqual(catalog.text("productTypeTaken", 93, {"code": "PCS"}), "Тип товара 'PCS' уже существует")

    def test_this_service_registers_its_catalog(self):
        self.assertIs(get_catalog_cache(), catalog_cache)
