
'use client';

import { cn } from "@/lib/utils";

interface RatingIconProps {
  score: number;
  className?: string;
}

export const TomatoIcon = ({ score, className }: RatingIconProps) => {
  const isFresh = score >= 60;
  
  if (isFresh) {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-5 h-5 drop-shadow-sm", className)}>
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#FA320A"/>
        <path d="M12 2C12 2 11 4 10 5C9 6 7 6 7 6M12 2C12 2 13 4 14 5C15 6 17 6 17 6M12 2V5" stroke="#00A839" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-5 h-5 drop-shadow-sm", className)}>
      <path d="M12 20C10 22 6 21 4 18C2 15 3 11 6 9C9 7 13 8 16 6C19 4 22 7 21 11C20 15 16 18 12 20Z" fill="#B1D12E"/>
      <path d="M14 6C14 6 13 4 12 3C11 2 9 2 9 2" stroke="#00A839" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
};

export const PopcornIcon = ({ score, className }: RatingIconProps) => {
  const isFresh = score >= 60;
  
  if (isFresh) {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-5 h-5 drop-shadow-sm", className)}>
        <path d="M6 10L4 22H20L18 10H6Z" fill="#FA320A"/>
        <path d="M7 10C7 8.34315 8.34315 7 10 7C11.6569 7 13 8.34315 13 10M11 10C11 8.34315 12.3431 7 14 7C15.6569 7 17 8.34315 17 10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M10 14L12 16L14 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-5 h-5 grayscale", className)}>
      <path d="M6 10L4 22H20L18 10H6Z" fill="#666"/>
      <path d="M7 10C7 8.34315 8.34315 7 10 7C11.6569 7 13 8.34315 13 10M11 10C11 8.34315 12.3431 7 14 7C15.6569 7 17 8.34315 17 10" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
};
