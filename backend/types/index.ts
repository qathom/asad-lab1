import { BetType } from "../src/app/utils/BetType";

export type ClientInitData = {
  playerId: string;
};

export type ClientBetData = {
  playerId: string;
  cell: number;
  betType: BetType;
  amount: number;
};
