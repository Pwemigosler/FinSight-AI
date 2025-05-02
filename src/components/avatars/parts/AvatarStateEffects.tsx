
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
  
  if (state === "happy") {
    return (
      <div className="absolute top-0 right-0 animate-pulse">
        <div className="w-2 h-2 bg-yellow-400 rounded-full opacity-70"></div>
      </div>
    );
  }
  
  return null;
};

export default AvatarStateEffects;
