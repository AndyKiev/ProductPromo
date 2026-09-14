"""Domain message keys, fallback templates and initial Russian translations."""

KEY_LINK_NOT_FOUND = {'message_key': 'keyLinkNotFound', 'fallback': 'KeyLink level ${level} with ID ${id} not found', 'rus': 'Связь ключа уровня ${level} с ID ${id} не найдена'}

KEY_LINK_DELETE_ERROR = {'message_key': 'keyLinkDeleteError', 'fallback': 'KeyLink level ${level} with ID ${id} cannot be deleted because it is referenced by other records', 'rus': 'Связь ключа уровня ${level} с ID ${id}: невозможно удалить, запись используется в других данных'}

KEY_LINK_CREATE_SUCCESS = {'message_key': 'keyLinkCreateSuccess', 'fallback': 'KeyLink level ${level} successfully created', 'rus': 'Связь ключа уровня ${level} создана'}

KEY_LINK_UPDATE_SUCCESS = {'message_key': 'keyLinkUpdateSuccess', 'fallback': 'KeyLink level ${level} successfully updated', 'rus': 'Связь ключа уровня ${level} обновлена'}

KEY_LINK_DELETE_SUCCESS = {'message_key': 'keyLinkDeleteSuccess', 'fallback': 'KeyLink level ${level} successfully deleted', 'rus': 'Связь ключа уровня ${level} удалена'}
