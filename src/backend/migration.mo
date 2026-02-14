import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";

module {
  type RoomCode = Text;
  type PlayerId = Text;

  type PersonalityCard = {
    trait : Text;
  };

  type OldPlayer = {
    id : PlayerId;
    name : Text;
    isAnchor : Bool;
    personalityCard : ?PersonalityCard;
  };

  type ChatMessage = {
    sender : Text;
    message : Text;
    timestamp : Int;
  };

  type OldRoomState = {
    roomCode : RoomCode;
    hostId : PlayerId;
    players : [OldPlayer];
    chatMessages : [ChatMessage];
    phase : { #waiting; #chatting; #guessing; #results };
  };

  type OldActor = {
    rooms : Map.Map<RoomCode, OldRoomState>;
  };

  type NewPlayer = {
    id : PlayerId;
    name : Text;
    isAnchor : Bool;
    personalityCard : ?PersonalityCard;
    role : Text;
  };

  type NewRoomState = {
    roomCode : RoomCode;
    hostId : PlayerId;
    players : [NewPlayer];
    chatMessages : [ChatMessage];
    phase : { #waiting; #chatting; #guessing; #results };
  };

  type NewActor = {
    rooms : Map.Map<RoomCode, NewRoomState>;
  };

  public func run(old : OldActor) : NewActor {
    let newRooms = old.rooms.map<RoomCode, OldRoomState, NewRoomState>(
      func(_code, oldRoom) {
        let newPlayers = oldRoom.players.map(
          func(oldPlayer) {
            { oldPlayer with role = "" };
          }
        );
        { oldRoom with players = newPlayers };
      }
    );
    { rooms = newRooms };
  };
};
