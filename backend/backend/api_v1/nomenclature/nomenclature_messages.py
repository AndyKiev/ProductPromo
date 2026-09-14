"""Domain message keys, fallback templates and initial Russian translations."""

NOMENCLATURE_NOT_FOUND = {'message_key': 'nomenclatureNotFound', 'fallback': 'Nomenclature with ID ${id} not found', 'rus': 'Номенклатура с ID ${id} не найдена'}

NOMENCLATURE_DELETE_ERROR = {'message_key': 'nomenclatureDeleteError', 'fallback': "Nomenclature '${name}' cannot be deleted because it is referenced by other records", 'rus': "Номенклатура '${name}': невозможно удалить, запись используется в других данных"}

NOMENCLATURE_CREATE_SUCCESS = {'message_key': 'nomenclatureCreateSuccess', 'fallback': "Nomenclature '${name}' successfully created", 'rus': "Номенклатура '${name}' создана"}

NOMENCLATURE_UPDATE_SUCCESS = {'message_key': 'nomenclatureUpdateSuccess', 'fallback': "Nomenclature '${name}' successfully updated", 'rus': "Номенклатура '${name}' обновлена"}

NOMENCLATURE_DELETE_SUCCESS = {'message_key': 'nomenclatureDeleteSuccess', 'fallback': "Nomenclature '${name}' successfully deleted", 'rus': "Номенклатура '${name}' удалена"}
