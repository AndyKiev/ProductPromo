"""Domain message keys, fallback templates and initial Russian translations."""

TAX_TYPE_NOT_FOUND = {'message_key': 'taxTypeNotFound', 'fallback': 'Tax type with ID ${id} not found', 'rus': 'Тип налога с ID ${id} не найден'}

TAX_TYPE_CODE_TAKEN = {'message_key': 'taxTypeCodeTaken', 'fallback': "Tax type with code '${code}' already exists", 'rus': "Тип налога с кодом '${code}' уже существует"}

TAX_TYPE_DELETE_ERROR = {'message_key': 'taxTypeDeleteError', 'fallback': "Tax type '${name}' cannot be deleted because it is referenced by other records", 'rus': "Тип налога '${name}': невозможно удалить, запись используется в других данных"}

TAX_TYPE_CREATE_SUCCESS = {'message_key': 'taxTypeCreateSuccess', 'fallback': "Tax type '${code}' successfully created", 'rus': "Тип налога '${code}' создан"}

TAX_TYPE_UPDATE_SUCCESS = {'message_key': 'taxTypeUpdateSuccess', 'fallback': "Tax type '${code}' successfully updated", 'rus': "Тип налога '${code}' обновлён"}

TAX_TYPE_DELETE_SUCCESS = {'message_key': 'taxTypeDeleteSuccess', 'fallback': "Tax type '${name}' successfully deleted", 'rus': "Тип налога '${name}' удалён"}
