'use client';

import React, { useMemo } from 'react';

interface UserAvatarProps {
  userName: string;
  size?: number;
  className?: string;
  imageUrl?: string;
}

// Common female names for basic gender detection
const femaleNames = [
  'mary', 'patricia', 'jennifer', 'linda', 'elizabeth', 'barbara', 'susan', 'jessica',
  'sarah', 'karen', 'lisa', 'nancy', 'betty', 'margaret', 'sandra', 'ashley', 'kimberly',
  'emily', 'donna', 'michelle', 'carol', 'amanda', 'melissa', 'deborah', 'stephanie',
  'rebecca', 'laura', 'helen', 'sharon', 'cynthia', 'kathleen', 'amy', 'anna', 'emma',
  'olivia', 'sophia', 'isabella', 'mia', 'charlotte', 'amelia', 'harper', 'evelyn',
  'abigail', 'emily', 'elizabeth', 'mila', 'ella', 'avery', 'sofia', 'camila', 'aria',
  'scarlett', 'victoria', 'madison', 'luna', 'grace', 'chloe', 'penelope', 'layla'
];

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  userName = 'Unknown User', 
  size = 40, 
  className = '',
  imageUrl
}) => {
  // Generate avatar URL
  const avatarUrl = useMemo(() => {
    if (!userName) return '';
    
    // Try to detect gender based on name
    let isFemale = false;
    const firstName = userName.split(' ')[0].toLowerCase();
    isFemale = femaleNames.includes(firstName);
    
    // Encode the username for URL
    const seed = encodeURIComponent(userName);
    
    // Set options based on detected gender
    const options = {
      mouth: ['smile', 'twinkle', 'tongue'],
      eyes: ['happy', 'eyeRoll', 'wink', 'winkWacky'],
      eyebrows: ['defaultNatural', 'flatNatural', 'raisedExcited'],
      hairColor: ['black', 'auburn', 'blonde', 'brown', 'pastel', 'platinum'],
      clothingColor: ['blue', 'gray', 'heather', 'pastel', 'pink', 'red', 'white'],
      accessoriesProbability: 30,
      facialHairProbability: isFemale ? 0 : 50,
      backgroundColor: 'transparent'
    };
    
    // Build the URL with options
    const optionsQuery = Object.entries(options)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map(v => `options[${key}][]=${v}`).join('&');
        }
        return `options[${key}]=${value}`;
      })
      .join('&');
    
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&${optionsQuery}`;
  }, [userName]);

  return (
    <div 
      className={`user-avatar ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
      }}
    >
      <img 
        src={imageUrl || avatarUrl} 
        alt={`${userName}'s avatar`}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default UserAvatar; 