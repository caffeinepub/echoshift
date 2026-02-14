import Array "mo:core/Array";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";

actor {
  type RoomCode = Text;
  type PlayerId = Text;

  type PersonalityCard = {
    trait : Text;
  };

  type Player = {
    id : PlayerId;
    name : Text;
    isAnchor : Bool;
    personalityCard : ?PersonalityCard;
  };

  type ChatMessage = {
    sender : Text;
    message : Text;
    timestamp : Time.Time;
  };

  type RoomState = {
    roomCode : RoomCode;
    hostId : PlayerId;
    players : [Player];
    chatMessages : [ChatMessage];
    phase : { #waiting; #chatting; #guessing; #results };
  };

  let rooms = Map.empty<RoomCode, RoomState>();

  public shared ({ caller }) func createRoom(hostId : PlayerId, hostName : Text, roomCode : RoomCode) : async () {
    if (rooms.containsKey(roomCode)) {
      Runtime.trap("Room code already exists");
    };

    let host : Player = {
      id = hostId;
      name = hostName;
      isAnchor = false;
      personalityCard = null;
    };

    let newRoom : RoomState = {
      roomCode;
      hostId;
      players = [host];
      chatMessages = [];
      phase = #waiting;
    };

    rooms.add(roomCode, newRoom);
  };

  public shared ({ caller }) func joinRoom(roomCode : RoomCode, playerId : PlayerId, playerName : Text) : async () {
    let room = switch (rooms.get(roomCode)) {
      case (null) { Runtime.trap("Room not found") };
      case (?value) { value };
    };

    if (room.players.size() >= 6) {
      Runtime.trap("Room is full");
    };

    let newPlayer : Player = {
      id = playerId;
      name = playerName;
      isAnchor = false;
      personalityCard = null;
    };

    let updatedPlayers = room.players.concat([newPlayer]);
    let newRoom = {
      room with
      players = updatedPlayers;
    };

    rooms.add(roomCode, newRoom);
  };

  public shared ({ caller }) func startGame(roomCode : RoomCode, hostId : PlayerId) : async () {
    let room = switch (rooms.get(roomCode)) {
      case (null) { Runtime.trap("Room not found") };
      case (?value) { value };
    };

    if (room.hostId != hostId) {
      Runtime.trap("Only the host can start the game");
    };

    if (room.players.size() < 3) {
      Runtime.trap("Need at least 3 players to start the game");
    };

    let updatedPlayers = room.players.map(
      func(player) {
        if (player.id == hostId) {
          { player with isAnchor = true };
        } else {
          {
            player with
            isAnchor = false;
            personalityCard = ?{ trait = "RandomTrait" };
          };
        };
      }
    );

    let newRoom = {
      room with
      players = updatedPlayers;
      phase = #chatting;
    };

    rooms.add(roomCode, newRoom);
  };

  public query ({ caller }) func getRoomState(roomCode : RoomCode) : async RoomState {
    switch (rooms.get(roomCode)) {
      case (null) { Runtime.trap("Room not found") };
      case (?state) { state };
    };
  };

  public shared ({ caller }) func sendMessage(roomCode : RoomCode, sender : Text, message : Text) : async () {
    let room = switch (rooms.get(roomCode)) {
      case (null) { Runtime.trap("Room not found") };
      case (?value) { value };
    };

    let newMessage : ChatMessage = {
      sender;
      message;
      timestamp = Time.now();
    };

    let updatedMessages = room.chatMessages.concat([newMessage]);
    let newRoom = {
      room with
      chatMessages = updatedMessages;
    };

    rooms.add(roomCode, newRoom);
  };
};
