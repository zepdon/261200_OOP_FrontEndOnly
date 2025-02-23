// src/context/GameConfigContext.tsx
"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

export type GameMode = "DUEL" | "SOLITAIRE" | "AUTO";

export interface MinionTypeConfig {
  name: string;
  defenseFactor: number;
  strategy: string;
}

interface GameConfig {
  mode?: GameMode;
  minionCount?: number;
  minionTypes: MinionTypeConfig[];
  setMode: (mode: GameMode) => void;
  setMinionCount: (count: number) => void;
  addMinionType: (minion: MinionTypeConfig) => void;
}

const GameConfigContext = createContext<GameConfig | undefined>(undefined);

export const GameConfigProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<GameMode>();
  const [minionCount, setMinionCount] = useState<number>();
  const [minionTypes, setMinionTypes] = useState<MinionTypeConfig[]>([]);

  const addMinionType = (minion: MinionTypeConfig) => {
    setMinionTypes(prev => [...prev, minion]);
  };

  return (
    <GameConfigContext.Provider value={{ mode, minionCount, minionTypes, setMode, setMinionCount, addMinionType }}>
      {children}
    </GameConfigContext.Provider>
  );
};

export const useGameConfig = () => {
  const context = useContext(GameConfigContext);
  if (!context) {
    throw new Error("useGameConfig must be used within a GameConfigProvider");
  }
  return context;
};
