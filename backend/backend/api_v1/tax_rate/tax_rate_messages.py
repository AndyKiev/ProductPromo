"""Domain message keys, fallback templates and initial Russian translations."""

TAX_RATE_NOT_FOUND = {'message_key': 'taxRateNotFound', 'fallback': 'Tax rate with ID ${id} not found', 'rus': 'Ставка налога с ID ${id} не найдена'}

TAX_RATE_DELETE_ERROR = {'message_key': 'taxRateDeleteError', 'fallback': "Tax rate '${name}' cannot be deleted because it is referenced by other records", 'rus': "Ставка налога '${name}': невозможно удалить, запись используется в других данных"}

TAX_RATE_CREATE_SUCCESS = {'message_key': 'taxRateCreateSuccess', 'fallback': "Tax rate '${name}' successfully created", 'rus': "Ставка налога '${name}' создана"}

TAX_RATE_UPDATE_SUCCESS = {'message_key': 'taxRateUpdateSuccess', 'fallback': "Tax rate '${name}' successfully updated", 'rus': "Ставка налога '${name}' обновлена"}

TAX_RATE_DELETE_SUCCESS = {'message_key': 'taxRateDeleteSuccess', 'fallback': "Tax rate '${name}' successfully deleted", 'rus': "Ставка налога '${name}' удалена"}
