"""Domain message keys, fallback templates and initial Russian translations."""

SEGMENT_NOT_FOUND = {'message_key': 'segmentNotFound', 'fallback': 'Segment with ID ${id} not found', 'rus': 'Сегмент с ID ${id} не найден'}

SEGMENT_NAME_TAKEN = {'message_key': 'segmentNameTaken', 'fallback': "Segment '${name}' already exists", 'rus': "Сегмент '${name}' уже существует"}

SEGMENT_DELETE_ERROR = {'message_key': 'segmentDeleteError', 'fallback': "Segment '${name}' cannot be deleted because it is referenced by other records", 'rus': "Сегмент '${name}': невозможно удалить, запись используется в других данных"}

SEGMENT_CREATE_SUCCESS = {'message_key': 'segmentCreateSuccess', 'fallback': "Segment '${name}' successfully created", 'rus': "Сегмент '${name}' создан"}

SEGMENT_UPDATE_SUCCESS = {'message_key': 'segmentUpdateSuccess', 'fallback': "Segment '${name}' successfully updated", 'rus': "Сегмент '${name}' обновлён"}

SEGMENT_DELETE_SUCCESS = {'message_key': 'segmentDeleteSuccess', 'fallback': "Segment '${name}' successfully deleted", 'rus': "Сегмент '${name}' удалён"}
