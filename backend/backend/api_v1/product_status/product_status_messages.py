"""Domain message keys, fallback templates and initial Russian translations."""

PRODUCT_STATUS_NOT_FOUND = {'message_key': 'productStatusNotFound', 'fallback': 'Product status with ID ${id} not found', 'rus': 'Статус товара с ID ${id} не найден'}

PRODUCT_STATUS_CODE_TAKEN = {'message_key': 'productStatusCodeTaken', 'fallback': "Product status with code '${code}' already exists", 'rus': "Статус товара с кодом '${code}' уже существует"}

PRODUCT_STATUS_DELETE_ERROR = {'message_key': 'productStatusDeleteError', 'fallback': "Product status '${name}' cannot be deleted because it is referenced by other records", 'rus': "Статус товара '${name}': невозможно удалить, запись используется в других данных"}

PRODUCT_STATUS_CREATE_SUCCESS = {'message_key': 'productStatusCreateSuccess', 'fallback': "Product status '${code}' successfully created", 'rus': "Статус товара '${code}' создан"}

PRODUCT_STATUS_UPDATE_SUCCESS = {'message_key': 'productStatusUpdateSuccess', 'fallback': "Product status '${code}' successfully updated", 'rus': "Статус товара '${code}' обновлён"}

PRODUCT_STATUS_DELETE_SUCCESS = {'message_key': 'productStatusDeleteSuccess', 'fallback': "Product status '${name}' successfully deleted", 'rus': "Статус товара '${name}' удалён"}
