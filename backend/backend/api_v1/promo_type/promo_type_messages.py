"""Domain message keys, fallback templates and initial Russian translations."""

PROMO_TYPE_NOT_FOUND = {'message_key': 'promoTypeNotFound', 'fallback': 'Promo type with ID ${id} not found', 'rus': 'Тип промо с ID ${id} не найден'}

PROMO_TYPE_TAKEN = {'message_key': 'promoTypeTaken', 'fallback': "Promo type '${code}' already exists", 'rus': "Тип промо '${code}' уже существует"}

PROMO_TYPE_DELETE_ERROR = {'message_key': 'promoTypeDeleteError', 'fallback': "Promo type '${name}' cannot be deleted because it is referenced by other records", 'rus': "Тип промо '${name}': невозможно удалить, запись используется в других данных"}

PROMO_TYPE_CREATE_SUCCESS = {'message_key': 'promoTypeCreateSuccess', 'fallback': "Promo type '${code}' successfully created", 'rus': "Тип промо '${code}' создан"}

PROMO_TYPE_UPDATE_SUCCESS = {'message_key': 'promoTypeUpdateSuccess', 'fallback': "Promo type '${code}' successfully updated", 'rus': "Тип промо '${code}' обновлён"}

PROMO_TYPE_DELETE_SUCCESS = {'message_key': 'promoTypeDeleteSuccess', 'fallback': "Promo type '${name}' successfully deleted", 'rus': "Тип промо '${name}' удалён"}
