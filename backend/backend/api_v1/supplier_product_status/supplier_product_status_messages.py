"""Domain message keys, fallback templates and initial Russian translations."""

SUPPLIER_PRODUCT_STATUS_NOT_FOUND = {'message_key': 'supplierProductStatusNotFound', 'fallback': 'Supplier product status with ID ${id} not found', 'rus': 'Статус товара у поставщика с ID ${id} не найден'}

SUPPLIER_PRODUCT_STATUS_CODE_TAKEN = {'message_key': 'supplierProductStatusCodeTaken', 'fallback': "Supplier product status with code '${code}' already exists", 'rus': "Статус товара у поставщика с кодом '${code}' уже существует"}

SUPPLIER_PRODUCT_STATUS_DELETE_ERROR = {'message_key': 'supplierProductStatusDeleteError', 'fallback': "Supplier product status '${name}' cannot be deleted because it is referenced by other records", 'rus': "Статус товара у поставщика '${name}': невозможно удалить, запись используется в других данных"}

SUPPLIER_PRODUCT_STATUS_CREATE_SUCCESS = {'message_key': 'supplierProductStatusCreateSuccess', 'fallback': "Supplier product status '${code}' successfully created", 'rus': "Статус товара у поставщика '${code}' создан"}

SUPPLIER_PRODUCT_STATUS_UPDATE_SUCCESS = {'message_key': 'supplierProductStatusUpdateSuccess', 'fallback': "Supplier product status '${code}' successfully updated", 'rus': "Статус товара у поставщика '${code}' обновлён"}

SUPPLIER_PRODUCT_STATUS_DELETE_SUCCESS = {'message_key': 'supplierProductStatusDeleteSuccess', 'fallback': "Supplier product status '${name}' successfully deleted", 'rus': "Статус товара у поставщика '${name}' удалён"}
