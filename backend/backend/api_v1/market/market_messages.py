"""Domain message keys, fallback templates and initial Russian translations."""

MARKET_NOT_FOUND = {'message_key': 'marketNotFound', 'fallback': 'Market with ID ${id} not found', 'rus': 'Рынок с ID ${id} не найден'}

MARKET_NAME_TAKEN = {'message_key': 'marketNameTaken', 'fallback': "Market '${name}' already exists", 'rus': "Рынок '${name}' уже существует"}

MARKET_DELETE_ERROR = {'message_key': 'marketDeleteError', 'fallback': "Market '${name}' cannot be deleted because it is referenced by other records", 'rus': "Рынок '${name}': невозможно удалить, запись используется в других данных"}

MARKET_CREATE_SUCCESS = {'message_key': 'marketCreateSuccess', 'fallback': "Market '${name}' successfully created", 'rus': "Рынок '${name}' создан"}

MARKET_UPDATE_SUCCESS = {'message_key': 'marketUpdateSuccess', 'fallback': "Market '${name}' successfully updated", 'rus': "Рынок '${name}' обновлён"}

MARKET_DELETE_SUCCESS = {'message_key': 'marketDeleteSuccess', 'fallback': "Market '${name}' successfully deleted", 'rus': "Рынок '${name}' удалён"}
