import * as Handler from "./handler";
import ServerClient from "background-script/clients/ServerClient";
import { FromServerMessageType } from "types/serverMessage";

const serverClient = ServerClient.getInstance();

serverClient.addHandler(FromServerMessageType.JOINED_ROOM, Handler.joinedRoom);

serverClient.addHandler(FromServerMessageType.VIDEO_REMOVED, Handler.videoRemoved);

serverClient.addHandler(FromServerMessageType.VIDEO_ADDED, Handler.videoAdded);

serverClient.addHandler(FromServerMessageType.PLAYLIST_REORDERED, Handler.playlistReordered);

serverClient.addHandler(FromServerMessageType.MEMBER_JOINED, Handler.memberJoined);

serverClient.addHandler(FromServerMessageType.MEMBER_DISCONNECTED, Handler.memberDisconnected);

serverClient.addHandler(FromServerMessageType.MEMBER_UPDATED, Handler.memberUpdated);

serverClient.addHandler(FromServerMessageType.IS_ADMIN_UPDATED, Handler.isAdminUpdated);

serverClient.addHandler(FromServerMessageType.PLAYER_STATE_UPDATED, Handler.playerStateUpdated);

serverClient.addHandler(FromServerMessageType.PLAYER_VIDEO_UPDATED, Handler.playerVideoUpdated);

serverClient.addCloseCodeHandler(4001, Handler.kickedFromRoom);
