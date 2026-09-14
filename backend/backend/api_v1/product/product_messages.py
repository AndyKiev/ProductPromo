"""Domain message keys, fallback templates and initial Russian translations."""

PRODUCT_NOT_FOUND = {'message_key': 'productNotFound', 'fallback': 'Product with ID ${id} not found', 'rus': 'Товар с ID ${id} не найден'}

PRODUCT_CODE_TAKEN = {'message_key': 'productCodeTaken', 'fallback': "Product with code '${code}' already exists", 'rus': "Товар с кодом '${code}' уже существует"}

PRODUCT_DELETE_ERROR = {'message_key': 'productDeleteError', 'fallback': "Product '${name}' cannot be deleted because it is referenced by other records", 'rus': "Товар '${name}': невозможно удалить, запись используется в других данных"}

PRODUCT_CREATE_SUCCESS = {'message_key': 'productCreateSuccess', 'fallback': "Product '${code}' successfully created", 'rus': "Товар '${code}' создан"}

PRODUCT_UPDATE_SUCCESS = {'message_key': 'productUpdateSuccess', 'fallback': "Product '${code}' successfully updated", 'rus': "Товар '${code}' обновлён"}

PRODUCT_DELETE_SUCCESS = {'message_key': 'productDeleteSuccess', 'fallback': "Product '${name}' successfully deleted", 'rus': "Товар '${name}' удалён"}
