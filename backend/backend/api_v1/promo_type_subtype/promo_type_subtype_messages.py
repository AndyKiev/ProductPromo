"""Domain message keys, fallback templates and initial Russian translations."""

PROMO_TYPE_SUBTYPE_NOT_FOUND = {'message_key': 'promoTypeSubtypeNotFound', 'fallback': 'Promo type subtype link with ID ${id} not found', 'rus': 'Связь типа и подтипа промо с ID ${id} не найдена'}

PROMO_TYPE_SUBTYPE_TAKEN = {'message_key': 'promoTypeSubtypeTaken', 'fallback': "Subtype '${subtype}' is already linked to promo type '${type}'", 'rus': "Подтип '${subtype}' уже связан с типом промо '${type}'"}

PROMO_TYPE_SUBTYPE_CREATE_SUCCESS = {'message_key': 'promoTypeSubtypeCreateSuccess', 'fallback': "Subtype '${subtype}' linked to promo type '${type}'", 'rus': "Подтип '${subtype}' связан с типом промо '${type}'"}

PROMO_TYPE_SUBTYPE_UPDATE_SUCCESS = {'message_key': 'promoTypeSubtypeUpdateSuccess', 'fallback': "Link updated: '${type}' – '${subtype}'", 'rus': "Связь обновлена: '${type}' – '${subtype}'"}

PROMO_TYPE_SUBTYPE_DELETE_SUCCESS = {'message_key': 'promoTypeSubtypeDeleteSuccess', 'fallback': "Subtype '${subtype}' unlinked from promo type '${type}'", 'rus': "Подтип '${subtype}' отвязан от типа промо '${type}'"}
