from backend.api_v1.base.success import DomainSuccess, DeleteSuccess, CreateSuccess, UpdateSuccess


class SegmentCreateSuccess(CreateSuccess):
    message_key = "segmentCreateSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Segment '{name}' successfully created"
        DomainSuccess.__init__(self, self.fallback)


class SegmentUpdateSuccess(UpdateSuccess):
    message_key = "segmentUpdateSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Segment '{name}' successfully updated"
        DomainSuccess.__init__(self, self.fallback)


class SegmentDeleteSuccess(DeleteSuccess):
    message_key = "segmentDeleteSuccess"

    def __init__(self, name: str) -> None:
        self.template_vars = {"name": name}
        self.fallback = f"Segment '{name}' successfully deleted"
        DomainSuccess.__init__(self, self.fallback)
