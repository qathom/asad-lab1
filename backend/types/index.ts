import { BetType } from "../src/app/utils/BetType";

export type ClientInitData = {
  playerId: string;
  playerPassword: string;
};


export type ClientAccountData = {
  playerId: string;
  playerPassword: string;
  playerBalance: number;
};


export type ClientBetData = {
  playerId: string;
  cell: number;
  betType: BetType;
  amount: number;
};
