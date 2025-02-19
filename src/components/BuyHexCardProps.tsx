import React from "react";

interface BuyHexCardProps {
  onClose: () => void;
}

const BuyHexCard: React.FC<BuyHexCardProps> = ({ onClose }) => {
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black ">
      <div className="w-40 bg-black text-white p-4 rounded-lg text-center relative">
        <h2 className="text-lg font-bold">Buy Hex</h2>
        <div className="bg-white p-2 rounded-lg mt-2">
          <svg width="200" height="200" viewBox="0 0 100 100" className="mx-auto">
            <polygon points="25,10 75,10 95,50 75,90 25,90 5,50" fill="skyblue" stroke="black" strokeWidth="2" />
          </svg>
          <div className="flex justify-center items-center mt-2">
            <span className="text-black text-xl font-bold">$</span>
            <span className="text-black text-xl font-bold ml-1">100</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="bg-gray-500 text-Black px-4 py-1 mt-3 rounded-lg"
        >
          SKIP
        </button>
      </div>
    </div>
  );
};

export default BuyHexCard;
