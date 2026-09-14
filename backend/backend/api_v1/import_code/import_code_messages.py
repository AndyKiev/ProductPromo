"""Domain message keys, fallback templates and initial Russian translations."""

IMPORT_CODE_NOT_FOUND = {'message_key': 'importCodeNotFound', 'fallback': 'Import code with ID ${id} not found', 'rus': 'Код импорта с ID ${id} не найден'}

IMPORT_CODE_TAKEN = {'message_key': 'importCodeTaken', 'fallback': "Import code '${code}' already exists", 'rus': "Код импорта '${code}' уже существует"}

IMPORT_CODE_DELETE_ERROR = {'message_key': 'importCodeDeleteError', 'fallback': "Import code '${name}' cannot be deleted because it is referenced by other records", 'rus': "Код импорта '${name}': невозможно удалить, запись используется в других данных"}

IMPORT_CODE_CREATE_SUCCESS = {'message_key': 'importCodeCreateSuccess', 'fallback': "Import code '${code}' successfully created", 'rus': "Код импорта '${code}' создан"}

IMPORT_CODE_UPDATE_SUCCESS = {'message_key': 'importCodeUpdateSuccess', 'fallback': "Import code '${code}' successfully updated", 'rus': "Код импорта '${code}' обновлён"}

IMPORT_CODE_DELETE_SUCCESS = {'message_key': 'importCodeDeleteSuccess', 'fallback': "Import code '${name}' successfully deleted", 'rus': "Код импорта '${name}' удалён"}
