import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Bool "mo:core/Bool";

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

  type Topic = {
    question : Text;
  };

  type TopicVote = {
    playerId : PlayerId;
    topicIndex : Nat;
  };

  // PHASE ADT
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

  // ROOM STATE STRUCTURE
  type RoomState = {
    roomCode : RoomCode;
    hostId : PlayerId;
    players : List.List<Player>;
    chatMessages : List.List<ChatMessage>;
    phase : Phase;
    generatedTopics : [Topic];
    votes : List.List<TopicVote>;
    selectedTopic : ?Topic;
    topicSelectionStartTime : ?Time.Time;
    chatCountdownStartTime : ?Time.Time; // New field for synchronized chat phase countdown
    guesses : List.List<Guess>;
    roundNumber : Nat;
  };

  // ROOM STATE OUTPUT TO FRONTEND
  type RoomStateView = {
    roomCode : RoomCode;
    hostId : PlayerId;
    players : [PlayerView];
    chatMessages : [ChatMessage];
    phase : Phase;
    generatedTopics : [Topic];
    votes : [TopicVote];
    selectedTopic : ?Topic;
    topicSelectionStartTime : ?Time.Time;
    chatCountdownStartTime : ?Time.Time; // Include in view
    guesses : [Guess];
    roundNumber : Nat; // Send round number to UI (optional)
  };

  // Room cache
  let rooms = Map.empty<RoomCode, RoomState>();

  // Available topics for the game
  let availableTopics = [
    { question = "What is your favorite hobby?" },
    { question = "If you could travel anywhere, where would you go?" },
    { question = "What's your most memorable childhood experience?" },
    { question = "Do you prefer books or movies?" },
    { question = "What's your dream job?" },
    { question = "What would you do with a million dollars?" },
    { question = "What's your favorite food?" },
    { question = "Do you believe in aliens?" },
  ];

  // Create new room
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
      generatedTopics = [];
      votes = List.empty<TopicVote>();
      selectedTopic = null;
      topicSelectionStartTime = null;
      chatCountdownStartTime = null; // Initialize as null
      guesses = List.empty<Guess>();
      roundNumber = 1; // Initialize round number
    };

    rooms.add(roomCode, newRoom);
  };

  // Join existing room
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

  //---------------------------------------------------------------------//
  //                      Game Start & Phase Progression                //
  //---------------------------------------------------------------------//
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

    let playerCount = room.players.size();
    let randomIndex = 0; // Should randomize in future!
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

    // Assign roles (except "Anchor") randomly
    await assignRandomRoles(roomCode);

    let newRoom = {
      room with
      players = updatedPlayers;
      phase = #topicSelection;
      chatMessages = room.chatMessages;
      generatedTopics = generateRandomTopics();
      topicSelectionStartTime = ?Time.now();
      votes = List.empty<TopicVote>();
      selectedTopic = null;
      roundNumber = 1; // Reset round number at game start
    };

    rooms.add(roomCode, newRoom);
  };

  func assignRandomRoles(roomCode : RoomCode) : async () {
    let room = switch (rooms.get(roomCode)) {
      case (null) { Runtime.trap("Room not found") };
      case (?value) { value };
    };

    let roles = List.fromArray([
      "Overly Dramatic",
      "Suspicious",
      "Motivational",
      "Alien",
      "Villain",
      "Emotional",
      "Reporter",
      "Conspiracy",
    ]);
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

  func generateRandomTopics() : [Topic] {
    let totalTopics = availableTopics.size();
    if (totalTopics <= 3) {
      return availableTopics;
    };

    let start = 0; // Should randomize in future!
    Array.fromIter(availableTopics.values().take(3));
  };

  // Vote for topic selection
  public shared ({ caller }) func voteForTopic(roomCode : RoomCode, playerId : PlayerId, topicIndex : Nat) : async () {
    let room = switch (rooms.get(roomCode)) {
      case (null) { Runtime.trap("Room not found") };
      case (?value) { value };
    };

    assert (topicIndex < room.generatedTopics.size());

    let vote : TopicVote = {
      playerId;
      topicIndex;
    };

    room.votes.add(vote);

    let allVoted = room.votes.size() >= room.players.size();

    let isTopicSelectionComplete = switch (room.topicSelectionStartTime) {
      case (?startTime) {
        Time.now() - startTime > 20_000_000_000;
      };
      case (null) { false };
    };

    if (allVoted or isTopicSelectionComplete) {
      finalizeTopicSelection(roomCode, room);
    } else {
      rooms.add(roomCode, room);
    };
  };

  func finalizeTopicSelection(roomCode : RoomCode, room : RoomState) {
    var voteCounts = Array.tabulate(3, func(_) { 0 });

    for (vote in room.votes.values()) {
      let topicIdx = vote.topicIndex;
      if (topicIdx < 3) {
        voteCounts := Array.tabulate(
          3,
          func(i) {
            if (i == topicIdx) { voteCounts[i] + 1 } else { voteCounts[i] };
          },
        );
      };
    };

    let mostVotedIdx = findMostVotedIndex(voteCounts, 0);

    let selectedTopic = if (mostVotedIdx < room.generatedTopics.size()) {
      ?room.generatedTopics[mostVotedIdx];
    } else {
      null;
    };

    let newRoom = {
      room with
      selectedTopic;
      phase = #chatting;
      chatCountdownStartTime = ?Time.now();
    };

    rooms.add(roomCode, newRoom);
  };

  // OUTPUT public type for submitting guesses
  public type GuessingResult = {
    guesses : [Guess];
    correctCount : Nat;
  };

  // Updated submitGuesses logic:
  public shared ({ caller }) func submitGuesses(roomCode : RoomCode, guesses : [Guess]) : async GuessingResult {
    let room = switch (rooms.get(roomCode)) {
      case (null) { Runtime.trap("Room not found") };
      case (?r) { r };
    };

    if (room.phase != #guessing) {
      Runtime.trap("Not in guessing phase");
    };

    // Checks if a guess is correct based on the current game rules.
    let isCorrect = func(guess : Guess) : Bool {
      let player = room.players.toArray().find(func(p) { p.id == guess.targetId });
      switch (player) {
        case (null) { false };
        // A guess is correct if the role is not "Anchor" (meaning the person is not the anchor).
        case (?p) { p.role != "Anchor" };
      };
    };

    let correctCount = guesses.map(isCorrect).foldLeft(0, func(acc, current) { if (current) { acc + 1 } else { acc } });

    let newRoom = {
      room with
      guesses = List.fromArray<Guess>(guesses);
      phase = #results;
    };

    rooms.add(roomCode, newRoom);

    {
      guesses;
      correctCount;
    };
  };

  // "Play Again" button backend logic
  public shared ({ caller }) func playAgain(roomCode : RoomCode) : async () {
    let room = switch (rooms.get(roomCode)) {
      case (null) { Runtime.trap("Room not found") };
      case (?r) { r };
    };

    // Reset all round-specific state
    let newRoom = {
      room with
      phase = #waiting;
      generatedTopics = [];
      votes = List.empty<TopicVote>();
      selectedTopic = null;
      topicSelectionStartTime = null;
      chatCountdownStartTime = null;
      guesses = List.empty<Guess>();
    };

    rooms.add(roomCode, newRoom);
  };

  // Get current phase for a room (non-breaking, new method)
  public query ({ caller }) func getRoomPhase(roomCode : RoomCode) : async Phase {
    let room = switch (rooms.get(roomCode)) {
      case (null) { Runtime.trap("Room not found") };
      case (?state) { state };
    };
    room.phase;
  };

  // Maintain previous getRoomState logic (returns complete game state to frontend)
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
      votes = room.votes.toArray();
      guesses = room.guesses.toArray();
    };
  };

  public shared ({ caller }) func sendMessage(roomCode : RoomCode, sender : Text, message : Text) : async () {
    let room = switch (rooms.get(roomCode)) {
      case (null) { Runtime.trap("Room not found") };
      case (?value) { value };
    };

    switch (room.phase, room.chatCountdownStartTime) {
      case (#chatting, ?startTime) {
        let chatPhaseDuration = 180_000_000_000;
        if (Time.now() - startTime > chatPhaseDuration) {
          let newRoom = {
            room with
            phase = #guessing;
          };
          rooms.add(roomCode, newRoom);
          Runtime.trap("Chat phase has ended, cannot send messages");
        };
      };
      case (_, _) {};
    };

    let newMessage : ChatMessage = {
      sender;
      message;
      timestamp = Time.now();
    };

    room.chatMessages.add(newMessage);
    rooms.add(roomCode, room);
  };

  public shared ({ caller }) func checkAndAdvancePhase(roomCode : RoomCode) : async () {
    let room = switch (rooms.get(roomCode)) {
      case (null) { Runtime.trap("Room not found") };
      case (?value) { value };
    };

    switch (room.phase, room.chatCountdownStartTime) {
      case (#chatting, ?startTime) {
        let chatPhaseDuration = 180_000_000_000;
        if (Time.now() - startTime > chatPhaseDuration) {
          let newRoom = {
            room with
            phase = #guessing;
          };
          rooms.add(roomCode, newRoom);
        };
      };
      case (_, _) {};
    };
  };

  func findMostVotedIndex(votes : [Nat], idx : Nat) : Nat {
    if (votes.size() <= 1) {
      return 0;
    };
    if (idx + 1 < votes.size() and votes[idx] >= votes[idx + 1]) {
      return findMostVotedIndex(votes.sliceToArray(0, idx + 1), idx);
    };
    idx + 1;
  };
};
