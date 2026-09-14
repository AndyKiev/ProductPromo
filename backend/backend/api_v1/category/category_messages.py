"""Domain message keys, fallback templates and initial Russian translations."""

CATEGORY_NOT_FOUND = {'message_key': 'categoryNotFound', 'fallback': 'Category with ID ${id} not found', 'rus': 'Категория с ID ${id} не найдена'}

CATEGORY_NAME_TAKEN = {'message_key': 'categoryNameTaken', 'fallback': "Category '${name}' already exists", 'rus': "Категория '${name}' уже существует"}

CATEGORY_DELETE_ERROR = {'message_key': 'categoryDeleteError', 'fallback': "Category '${name}' cannot be deleted because it is referenced by other records", 'rus': "Категория '${name}': невозможно удалить, запись используется в других данных"}

CATEGORY_CREATE_SUCCESS = {'message_key': 'categoryCreateSuccess', 'fallback': "Category '${name}' successfully created", 'rus': "Категория '${name}' создана"}

CATEGORY_UPDATE_SUCCESS = {'message_key': 'categoryUpdateSuccess', 'fallback': "Category '${name}' successfully updated", 'rus': "Категория '${name}' обновлена"}

CATEGORY_DELETE_SUCCESS = {'message_key': 'categoryDeleteSuccess', 'fallback': "Category '${name}' successfully deleted", 'rus': "Категория '${name}' удалена"}
