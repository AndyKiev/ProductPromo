"""Domain message keys, fallback templates and initial Russian translations."""

FAMILY_NOT_FOUND = {'message_key': 'familyNotFound', 'fallback': 'Family with ID ${id} not found', 'rus': 'Семья с ID ${id} не найдена'}

FAMILY_NAME_TAKEN = {'message_key': 'familyNameTaken', 'fallback': "Family '${name}' already exists", 'rus': "Семья '${name}' уже существует"}

FAMILY_DELETE_ERROR = {'message_key': 'familyDeleteError', 'fallback': "Family '${name}' cannot be deleted because it is referenced by other records", 'rus': "Семья '${name}': невозможно удалить, запись используется в других данных"}

FAMILY_CREATE_SUCCESS = {'message_key': 'familyCreateSuccess', 'fallback': "Family '${name}' successfully created", 'rus': "Семья '${name}' создана"}

FAMILY_UPDATE_SUCCESS = {'message_key': 'familyUpdateSuccess', 'fallback': "Family '${name}' successfully updated", 'rus': "Семья '${name}' обновлена"}

FAMILY_DELETE_SUCCESS = {'message_key': 'familyDeleteSuccess', 'fallback': "Family '${name}' successfully deleted", 'rus': "Семья '${name}' удалена"}
