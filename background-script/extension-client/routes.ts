import * as Handler from "./handler";
import { BackgroundMessagingClient } from "background-script/clients/ExtensionClient";
import { ExtensionMessageType as EMT } from "types/extensionMessage";

const bgMessagingClient = BackgroundMessagingClient.getInstance();

// Profile
bgMessagingClient.addHandler(EMT.GET_PROFILE, Handler.getProfile);

bgMessagingClient.addHandler(EMT.UPDATE_PROFILE, Handler.updateProfile);

// Player && room
bgMessagingClient.addHandler(EMT.ADD_VIDEO, Handler.addVideo);

bgMessagingClient.addHandler(EMT.REMOVE_VIDEO, Handler.removeVideo);

bgMessagingClient.addHandler(EMT.GET_PLAYLIST, Handler.getPlaylist);

bgMessagingClient.addHandler(EMT.GET_MEMBERS, Handler.getMembers);

bgMessagingClient.addHandler(EMT.GET_ROOM_ID, Handler.getRoomId);

bgMessagingClient.addHandler(EMT.GET_IS_ADMIN, Handler.getIsAdmin);

bgMessagingClient.addHandler(EMT.PROMOTE_MEMBER, Handler.promoteMember);

bgMessagingClient.addHandler(EMT.REMOVE_MEMBER, Handler.removeMember);

bgMessagingClient.addHandler(EMT.SKIP_CURRENT_VIDEO, Handler.skipCurrentVideo);

bgMessagingClient.addHandler(EMT.UPDATE_PLAYER_VIDEO, Handler.updatePlayerVideo);

bgMessagingClient.addHandler(EMT.GET_PLAYER_STATE, Handler.getPlayerState);

bgMessagingClient.addHandler(EMT.GET_PLAYER_VIDEO_URL, Handler.getPlayerVideoUrl);

bgMessagingClient.addHandler(EMT.GET_LAST_VIDEO, Handler.getLastVideo);

bgMessagingClient.addHandler(EMT.UPDATE_MUTED, Handler.updateMuted);

bgMessagingClient.addHandler(EMT.UPDATE_PLAYER_STATE, Handler.updatePlayerState);

bgMessagingClient.addHandler(EMT.UPDATE_READY, Handler.updateReady);

bgMessagingClient.addHandler(EMT.CREATE_ROOM, Handler.createRoom);

bgMessagingClient.addHandler(EMT.SWITCH_TO_PRIMARY_TAB, Handler.switchToPrimaryTab);

bgMessagingClient.addHandler(EMT.IS_PRIMARY_TAB, Handler.isPrimaryTab);

bgMessagingClient.addHandler(EMT.IS_PRIMARY_TAB_EXISTS, Handler.isPrimaryTabExists);
