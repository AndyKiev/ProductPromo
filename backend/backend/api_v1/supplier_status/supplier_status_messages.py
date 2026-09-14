"""Domain message keys, fallback templates and initial Russian translations."""

SUPPLIER_STATUS_NOT_FOUND = {'message_key': 'supplierStatusNotFound', 'fallback': 'Supplier status with ID ${id} not found', 'rus': 'Статус поставщика с ID ${id} не найден'}

SUPPLIER_STATUS_CODE_TAKEN = {'message_key': 'supplierStatusCodeTaken', 'fallback': "Supplier status with code '${code}' already exists", 'rus': "Статус поставщика с кодом '${code}' уже существует"}

SUPPLIER_STATUS_DELETE_ERROR = {'message_key': 'supplierStatusDeleteError', 'fallback': "Supplier status '${name}' cannot be deleted because it is referenced by other records", 'rus': "Статус поставщика '${name}': невозможно удалить, запись используется в других данных"}

SUPPLIER_STATUS_CREATE_SUCCESS = {'message_key': 'supplierStatusCreateSuccess', 'fallback': "Supplier status '${code}' successfully created", 'rus': "Статус поставщика '${code}' создан"}

SUPPLIER_STATUS_UPDATE_SUCCESS = {'message_key': 'supplierStatusUpdateSuccess', 'fallback': "Supplier status '${code}' successfully updated", 'rus': "Статус поставщика '${code}' обновлён"}

SUPPLIER_STATUS_DELETE_SUCCESS = {'message_key': 'supplierStatusDeleteSuccess', 'fallback': "Supplier status '${name}' successfully deleted", 'rus': "Статус поставщика '${name}' удалён"}
