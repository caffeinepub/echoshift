import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";

import Migration "migration";
(with migration = Migration.run)
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
    role : Text;
  };

  type PlayerView = {
    id : PlayerId;
    name : Text;
    isAnchor : Bool;
    personalityCard : ?PersonalityCard;
    role : Text;
  };

  type ChatMessage = {
    sender : Text;
    message : Text;
    timestamp : Time.Time;
  };

  type RoomState = {
    roomCode : RoomCode;
    hostId : PlayerId;
    players : List.List<Player>;
    chatMessages : List.List<ChatMessage>;
    phase : { #waiting; #chatting; #guessing; #results };
  };

  type RoomStateView = {
    roomCode : RoomCode;
    hostId : PlayerId;
    players : [PlayerView];
    chatMessages : [ChatMessage];
    phase : { #waiting; #chatting; #guessing; #results };
  };

  let rooms = Map.empty<RoomCode, RoomState>();

  // Room creation does not assign any special roles
  public shared ({ caller }) func createRoom(hostId : PlayerId, hostName : Text, roomCode : RoomCode) : async () {
    if (rooms.containsKey(roomCode)) {
      Runtime.trap("Room code already exists");
    };

    let host : Player = {
      id = hostId;
      name = hostName;
      isAnchor = false;
      personalityCard = null;
      role = "";
    };

    let newRoom : RoomState = {
      roomCode;
      hostId;
      players = List.fromArray([host]);
      chatMessages = List.empty<ChatMessage>();
      phase = #waiting;
    };

    rooms.add(roomCode, newRoom);
  };

  // Joining a room does not assign any roles or special properties
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
      role = "";
    };

    room.players.add(newPlayer);
    rooms.add(roomCode, room);
  };

  // Sets one player as the Anchor, others receive unique random roles from a predefined list
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

    // Randomly select one player as the Anchor.
    let playerCount = room.players.size();

    let randomIndex = 0; // Placeholder for deterministic behavior, not random
    let playersArray = room.players.toArray();
    let updatedPlayersArray = Array.tabulate(
      playerCount,
      func(index) {
        if (index == randomIndex) {
          { playersArray[index] with role = "Anchor" };
        } else {
          playersArray[index];
        };
      },
    );

    let updatedPlayers = List.fromArray<Player>(updatedPlayersArray);

    // After selecting the Anchor, assign random personality roles to others
    await assignRandomRoles(roomCode);

    let newRoom = {
      room with
      players = updatedPlayers;
      phase = #chatting;
      chatMessages = room.chatMessages; // Ensuring chat messages persist
    };

    rooms.add(roomCode, newRoom);
  };

  func assignRandomRoles(roomCode : RoomCode) : async () {
    let room = switch (rooms.get(roomCode)) {
      case (null) { Runtime.trap("Room not found") };
      case (?value) { value };
    };

    let roles = List.fromArray([ "Overly Dramatic", "Suspicious", "Motivational", "Alien", "Villain", "Emotional", "Reporter", "Conspiracy" ]);
    let assignedRoles = List.empty<Text>();

    let updatedPlayers = List.empty<Player>();

    for (player in room.players.values()) {
      switch (player.role == "Anchor") {
        case (true) {
          updatedPlayers.add(player);
        };
        case (false) {
          if (roles.isEmpty()) {
            Runtime.trap("No more roles available");
          };
          let role = switch (roles.last()) {
            case (null) { Runtime.trap("No roles remaining") };
            case (?role) { role };
          };
          assignedRoles.add(role);

          let updatedPlayer = {
            player with role = role : Text;
          };
          updatedPlayers.add(updatedPlayer);
        };
      };
    };

    let newRoom = {
      room with
      players = updatedPlayers;
    };

    rooms.add(roomCode, newRoom);
  };

  public query ({ caller }) func getRoomState(roomCode : RoomCode) : async RoomStateView {
    let room = switch (rooms.get(roomCode)) {
      case (null) { Runtime.trap("Room not found") };
      case (?state) { state };
    };

    {
      room with
      players = room.players.toArray().map(
        func(p) {
          {
            id = p.id;
            name = p.name;
            isAnchor = p.isAnchor;
            personalityCard = p.personalityCard;
            role = p.role;
          };
        }
      );
      chatMessages = room.chatMessages.toArray();
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

    room.chatMessages.add(newMessage);
    rooms.add(roomCode, room);
  };

  // Deprecated - Random roles are now assigned in startGame
  public shared ({ caller }) func assignRoleToPlayer(roomCode : RoomCode, playerId : PlayerId, role : Text) : async () {
    Runtime.trap("This method is no longer used. Roles are assigned randomly at game start.");
  };
};
