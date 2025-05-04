
import React from 'react';
import { AvatarState } from '../types/avatar-types';

interface AvatarStateEffectsProps {
  state: AvatarState;
}

const AvatarStateEffects: React.FC<AvatarStateEffectsProps> = ({ state }) => {
  if (state === "thinking") {
    return (
      <div className="absolute bottom-1 right-1">
        <div className="flex space-x-1">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></span>
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce animate-delay-100"></span>
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce animate-delay-200"></span>
        </div>
      </div>
    );
  }
  
  if (state === "speaking") {
    return (
      <div className="absolute bottom-0 left-0 right-0 flex justify-center">
        <div className="flex space-x-1 mb-1">
          <span className="w-1 h-3 bg-white opacity-70 rounded-full animate-wave"></span>
          <span className="w-1 h-4 bg-white opacity-70 rounded-full animate-wave animate-delay-100"></span>
          <span className="w-1 h-2 bg-white opacity-70 rounded-full animate-wave animate-delay-200"></span>
          <span className="w-1 h-3 bg-white opacity-70 rounded-full animate-wave"></span>
        </div>
      </div>
    );
  }
  
  if (state === "happy") {
    return (
      <div className="absolute top-0 right-0 animate-pulse">
        <div className="w-2 h-2 bg-yellow-400 rounded-full opacity-70"></div>
      </div>
    );
  }
  
  if (state === "confused") {
    return (
      <div className="absolute top-1 left-0 right-0 flex justify-center">
        <div className="w-3 h-3 text-purple-500 animate-bounce">?</div>
      </div>
    );
  }
  
  if (state === "tip") {
    return (
      <div className="absolute top-0 left-0 right-0 flex justify-center">
        <div className="w-3 h-3 text-yellow-500 animate-pulse">💡</div>
      </div>
    );
  }
  
  return null;
};

export default AvatarStateEffects;
