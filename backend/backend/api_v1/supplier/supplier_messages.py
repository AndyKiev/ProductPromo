"""Domain message keys, fallback templates and initial Russian translations."""

SUPPLIER_NOT_FOUND = {'message_key': 'supplierNotFound', 'fallback': 'Supplier with ID ${id} not found', 'rus': 'Поставщик с ID ${id} не найден'}

SUPPLIER_CODE_TAKEN = {'message_key': 'supplierCodeTaken', 'fallback': "Supplier with code '${code}' already exists", 'rus': "Поставщик с кодом '${code}' уже существует"}

SUPPLIER_DELETE_ERROR = {'message_key': 'supplierDeleteError', 'fallback': "Supplier '${name}' cannot be deleted because it is referenced by other records", 'rus': "Поставщик '${name}': невозможно удалить, запись используется в других данных"}

SUPPLIER_CREATE_SUCCESS = {'message_key': 'supplierCreateSuccess', 'fallback': "Supplier '${code}' successfully created", 'rus': "Поставщик '${code}' создан"}

SUPPLIER_UPDATE_SUCCESS = {'message_key': 'supplierUpdateSuccess', 'fallback': "Supplier '${code}' successfully updated", 'rus': "Поставщик '${code}' обновлён"}

SUPPLIER_DELETE_SUCCESS = {'message_key': 'supplierDeleteSuccess', 'fallback': "Supplier '${name}' successfully deleted", 'rus': "Поставщик '${name}' удалён"}
