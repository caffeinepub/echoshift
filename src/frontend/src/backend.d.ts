import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type PlayerId = string;
export type Time = bigint;
export interface GuessingResult {
    correctCount: bigint;
    guesses: Array<Guess>;
}
export interface RoomStateView {
    selectedTopic?: Topic;
    generatedTopics: Array<Topic>;
    votes: Array<TopicVote>;
    chatMessages: Array<ChatMessage>;
    chatCountdownStartTime?: Time;
    players: Array<PlayerView>;
    phase: Phase;
    hostId: PlayerId;
    roomCode: RoomCode;
    roundNumber: bigint;
    topicSelectionStartTime?: Time;
    guesses: Array<Guess>;
}
export interface Topic {
    question: string;
}
export type RoomCode = string;
export interface PersonalityCard {
    trait: string;
}
export interface PlayerView {
    id: PlayerId;
    name: string;
    role: string;
    personalityCard?: PersonalityCard;
    isAnchor: boolean;
}
export interface Guess {
    guess: string;
    targetId: PlayerId;
    guesserId: PlayerId;
}
export interface ChatMessage {
    sender: string;
    message: string;
    timestamp: Time;
}
export interface TopicVote {
    playerId: PlayerId;
    topicIndex: bigint;
}
export enum Phase {
    results = "results",
    topicSelection = "topicSelection",
    waiting = "waiting",
    chatting = "chatting",
    guessing = "guessing"
}
export interface backendInterface {
    checkAndAdvancePhase(roomCode: RoomCode): Promise<void>;
    createRoom(hostId: PlayerId, hostName: string, roomCode: RoomCode): Promise<void>;
    getRoomPhase(roomCode: RoomCode): Promise<Phase>;
    getRoomState(roomCode: RoomCode): Promise<RoomStateView>;
    joinRoom(roomCode: RoomCode, playerId: PlayerId, playerName: string): Promise<void>;
    playAgain(roomCode: RoomCode): Promise<void>;
    sendMessage(roomCode: RoomCode, sender: string, message: string): Promise<void>;
    startGame(roomCode: RoomCode, hostId: PlayerId): Promise<void>;
    submitGuesses(roomCode: RoomCode, guesses: Array<Guess>): Promise<GuessingResult>;
    voteForTopic(roomCode: RoomCode, playerId: PlayerId, topicIndex: bigint): Promise<void>;
}
