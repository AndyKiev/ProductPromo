"""Domain message keys, fallback templates and initial Russian translations."""

PROMO_SUBTYPE_NOT_FOUND = {'message_key': 'promoSubtypeNotFound', 'fallback': 'Promo subtype with ID ${id} not found', 'rus': 'Подтип промо с ID ${id} не найден'}

PROMO_SUBTYPE_TAKEN = {'message_key': 'promoSubtypeTaken', 'fallback': "Promo subtype '${code}' already exists", 'rus': "Подтип промо '${code}' уже существует"}

PROMO_SUBTYPE_DELETE_ERROR = {'message_key': 'promoSubtypeDeleteError', 'fallback': "Promo subtype '${name}' cannot be deleted because it is referenced by other records", 'rus': "Подтип промо '${name}': невозможно удалить, запись используется в других данных"}

PROMO_SUBTYPE_CREATE_SUCCESS = {'message_key': 'promoSubtypeCreateSuccess', 'fallback': "Promo subtype '${code}' successfully created", 'rus': "Подтип промо '${code}' создан"}

PROMO_SUBTYPE_UPDATE_SUCCESS = {'message_key': 'promoSubtypeUpdateSuccess', 'fallback': "Promo subtype '${code}' successfully updated", 'rus': "Подтип промо '${code}' обновлён"}

PROMO_SUBTYPE_DELETE_SUCCESS = {'message_key': 'promoSubtypeDeleteSuccess', 'fallback': "Promo subtype '${name}' successfully deleted", 'rus': "Подтип промо '${name}' удалён"}
