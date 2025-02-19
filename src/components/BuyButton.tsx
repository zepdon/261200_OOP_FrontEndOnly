"use client";

import React from "react";

interface BuyButtonProps {
  onBuy: () => void;
}

const BuyButton: React.FC<BuyButtonProps> = ({ onBuy }) => {
  return (
    <button
      onClick={onBuy}
      style={{
        position: "absolute",
        top: "0px",
        right: "0px",
        padding: "10px",
        backgroundColor: "white",
        color: "black",
        borderRadius: "8px"
      }}
    >
      <span style={{ marginRight: "5px" }}>BUY</span>
    </button>
  );
};

export default BuyButton;