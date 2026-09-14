"""Domain message keys, fallback templates and initial Russian translations."""

EAN_NOT_FOUND = {'message_key': 'eanNotFound', 'fallback': 'EAN with ID ${id} not found', 'rus': 'Штрихкод с ID ${id} не найден'}

EAN_TAKEN = {'message_key': 'eanTaken', 'fallback': "EAN '${ean}' already exists", 'rus': "Штрихкод '${ean}' уже существует"}

EAN_DELETE_ERROR = {'message_key': 'eanDeleteError', 'fallback': "EAN '${name}' cannot be deleted because it is referenced by other records", 'rus': "Штрихкод '${name}': невозможно удалить, запись используется в других данных"}

EAN_CREATE_SUCCESS = {'message_key': 'eanCreateSuccess', 'fallback': "EAN '${ean}' successfully created", 'rus': "Штрихкод '${ean}' создан"}

EAN_UPDATE_SUCCESS = {'message_key': 'eanUpdateSuccess', 'fallback': "EAN '${ean}' successfully updated", 'rus': "Штрихкод '${ean}' обновлён"}

EAN_DELETE_SUCCESS = {'message_key': 'eanDeleteSuccess', 'fallback': "EAN '${name}' successfully deleted", 'rus': "Штрихкод '${name}' удалён"}
