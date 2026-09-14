from backend.api_v1.msg.msg_service import MsgService


def get_msg_service() -> MsgService:
    return MsgService()
