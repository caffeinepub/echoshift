import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Bool "mo:core/Bool";

module {
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

  type ChatMessage = {
    sender : Text;
    message : Text;
    timestamp : Time.Time;
  };

  type Topic = {
    question : Text;
  };

  type TopicVote = {
    playerId : PlayerId;
    topicIndex : Nat;
  };

  type Phase = {
    #waiting;
    #topicSelection;
    #chatting;
    #guessing;
    #results;
  };

  type Guess = {
    guesserId : PlayerId;
    targetId : PlayerId;
    guess : Text;
  };

  type OldRoomState = {
    roomCode : RoomCode;
    hostId : PlayerId;
    players : List.List<Player>;
    chatMessages : List.List<ChatMessage>;
    phase : Phase;
    generatedTopics : [Topic];
    votes : List.List<TopicVote>;
    selectedTopic : ?Topic;
    topicSelectionStartTime : ?Time.Time;
    chatCountdownStartTime : ?Time.Time;
    guesses : List.List<Guess>;
  };

  type NewRoomState = {
    roomCode : RoomCode;
    hostId : PlayerId;
    players : List.List<Player>;
    chatMessages : List.List<ChatMessage>;
    phase : Phase;
    generatedTopics : [Topic];
    votes : List.List<TopicVote>;
    selectedTopic : ?Topic;
    topicSelectionStartTime : ?Time.Time;
    chatCountdownStartTime : ?Time.Time;
    guesses : List.List<Guess>;
    roundNumber : Nat;
  };

  public func run(old : { rooms : Map.Map<RoomCode, OldRoomState> }) : { rooms : Map.Map<RoomCode, NewRoomState> } {
    let newRooms = old.rooms.map<RoomCode, OldRoomState, NewRoomState>(
      func(_code, oldRoom) {
        { oldRoom with roundNumber = 0 };
      }
    );
    { rooms = newRooms };
  };
};
