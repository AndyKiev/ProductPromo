"""Domain message keys, fallback templates and initial Russian translations."""

PRODUCT_TYPE_NOT_FOUND = {'message_key': 'productTypeNotFound', 'fallback': 'Product type with ID ${id} not found', 'rus': 'Тип товара с ID ${id} не найден'}

PRODUCT_TYPE_TAKEN = {'message_key': 'productTypeTaken', 'fallback': "Product type '${code}' already exists", 'rus': "Тип товара '${code}' уже существует"}

PRODUCT_TYPE_DELETE_ERROR = {'message_key': 'productTypeDeleteError', 'fallback': "Product type '${name}' cannot be deleted because it is referenced by other records", 'rus': "Тип товара '${name}': невозможно удалить, запись используется в других данных"}

PRODUCT_TYPE_CREATE_SUCCESS = {'message_key': 'productTypeCreateSuccess', 'fallback': "Product type '${code}' successfully created", 'rus': "Тип товара '${code}' создан"}

PRODUCT_TYPE_UPDATE_SUCCESS = {'message_key': 'productTypeUpdateSuccess', 'fallback': "Product type '${code}' successfully updated", 'rus': "Тип товара '${code}' обновлён"}

PRODUCT_TYPE_DELETE_SUCCESS = {'message_key': 'productTypeDeleteSuccess', 'fallback': "Product type '${name}' successfully deleted", 'rus': "Тип товара '${name}' удалён"}
