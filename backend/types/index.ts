import { BetType } from "../src/app/utils/BetType";

type TokenPayload = {
  token: string,
};

export type ClientInitData = {
  playerId: string;
  playerPassword: string;
};

export type ClientAccountData = TokenPayload & {
  playerId: string;
  playerPassword: string;
  playerBalance: number;
};

export type ClientBetData = TokenPayload & {
  playerId: string;
  cell: number;
  betType: BetType;
  amount: number;
};

export type VerifyTokenData = TokenPayload;
