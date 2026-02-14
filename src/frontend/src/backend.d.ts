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
export interface RoomState {
    chatMessages: Array<ChatMessage>;
    players: Array<Player>;
    phase: Variant_results_waiting_chatting_guessing;
    hostId: PlayerId;
    roomCode: RoomCode;
}
export interface Player {
    id: PlayerId;
    name: string;
    role: string;
    personalityCard?: PersonalityCard;
    isAnchor: boolean;
}
export type Time = bigint;
export type RoomCode = string;
export interface PersonalityCard {
    trait: string;
}
export interface ChatMessage {
    sender: string;
    message: string;
    timestamp: Time;
}
export enum Variant_results_waiting_chatting_guessing {
    results = "results",
    waiting = "waiting",
    chatting = "chatting",
    guessing = "guessing"
}
export interface backendInterface {
    createRoom(hostId: PlayerId, hostName: string, roomCode: RoomCode): Promise<void>;
    getRoomState(roomCode: RoomCode): Promise<RoomState>;
    joinRoom(roomCode: RoomCode, playerId: PlayerId, playerName: string): Promise<void>;
    sendMessage(roomCode: RoomCode, sender: string, message: string): Promise<void>;
    startGame(roomCode: RoomCode, hostId: PlayerId): Promise<void>;
}
