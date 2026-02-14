import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Int "mo:core/Int";

module {
  type OldPlayer = {
    id : Text;
    name : Text;
    isAnchor : Bool;
    personalityCard : ?{ trait : Text };
    role : Text;
  };

  type OldChatMessage = {
    sender : Text;
    message : Text;
    timestamp : Int;
  };

  type OldRoomState = {
    roomCode : Text;
    hostId : Text;
    players : [OldPlayer];
    chatMessages : [OldChatMessage];
    phase : { #waiting; #chatting; #guessing; #results };
  };

  type OldActor = {
    rooms : Map.Map<Text, OldRoomState>;
  };

  type NewActor = {
    rooms : Map.Map<Text, NewRoomState>;
  };

  type NewRoomState = {
    roomCode : Text;
    hostId : Text;
    players : List.List<OldPlayer>;
    chatMessages : List.List<OldChatMessage>;
    phase : { #waiting; #chatting; #guessing; #results };
  };

  public func run(old : OldActor) : NewActor {
    let newRooms = old.rooms.map<Text, OldRoomState, NewRoomState>(
      func(_code, oldRoom) {
        {
          oldRoom with
          players = List.fromArray(oldRoom.players);
          chatMessages = List.fromArray(oldRoom.chatMessages);
        };
      }
    );
    { rooms = newRooms };
  };
};
