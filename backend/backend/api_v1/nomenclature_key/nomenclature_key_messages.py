"""Domain message keys, fallback templates and initial Russian translations."""

NOMENCLATURE_KEY_NOT_FOUND = {'message_key': 'nomenclature_keyNotFound', 'fallback': 'NomenclatureKey with ID ${id} not found', 'rus': 'Ключ номенклатуры с ID ${id} не найден'}

NOMENCLATURE_KEY_NAME_TAKEN = {'message_key': 'nomenclature_keyNameTaken', 'fallback': "NomenclatureKey '${name}' already exists", 'rus': "Ключ номенклатуры '${name}' уже существует"}

NOMENCLATURE_KEY_DELETE_ERROR = {'message_key': 'nomenclature_keyDeleteError', 'fallback': "NomenclatureKey '${name}' cannot be deleted because it is referenced by other records", 'rus': "Ключ номенклатуры '${name}': невозможно удалить, запись используется в других данных"}

NOMENCLATURE_KEY_CREATE_SUCCESS = {'message_key': 'nomenclature_keyCreateSuccess', 'fallback': "NomenclatureKey '${name}' successfully created", 'rus': "Ключ номенклатуры '${name}' создан"}

NOMENCLATURE_KEY_UPDATE_SUCCESS = {'message_key': 'nomenclature_keyUpdateSuccess', 'fallback': "NomenclatureKey '${name}' successfully updated", 'rus': "Ключ номенклатуры '${name}' обновлён"}

NOMENCLATURE_KEY_DELETE_SUCCESS = {'message_key': 'nomenclature_keyDeleteSuccess', 'fallback': "NomenclatureKey '${name}' successfully deleted", 'rus': "Ключ номенклатуры '${name}' удалён"}
