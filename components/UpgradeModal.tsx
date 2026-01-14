
import React from 'react';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  onConfirmUpgrade: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  open,
  onClose,
  onConfirmUpgrade,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-primary">
            Upgrade to StartupPrice AI Pro
          </h2>
          <div className="h-1 w-16 bg-accent rounded-full"></div>
        </div>

        {/* Features List */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-success text-xl">✓</span>
            <span className="text-gray-700 font-medium">Unlimited businesses</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-success text-xl">✓</span>
            <span className="text-gray-700 font-medium">Unlimited products and simulations</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-success text-xl">✓</span>
            <span className="text-gray-700 font-medium">Better control of your profit</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={onConfirmUpgrade}
            className="w-full bg-gradient-to-r from-accent to-orange-400 text-white py-4 px-6 rounded-2xl font-bold shadow-lg shadow-orange-200 transform active:scale-95 transition-all"
          >
            Mark me as Pro (test mode)
          </button>
          <button
            onClick={onClose}
            className="w-full border-2 border-gray-200 text-gray-500 py-4 px-6 rounded-2xl font-bold hover:border-gray-300 transition-all"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};

