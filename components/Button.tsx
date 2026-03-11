import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-colors duration-200 rounded-full";
  
  const variants = {
    primary: "bg-brand-red text-white hover:bg-red-700 px-6 py-3",
    secondary: "bg-brand-gray text-white hover:bg-zinc-700 px-6 py-3",
    ghost: "bg-transparent text-white border border-white/20 hover:bg-white/10 px-6 py-3",
    icon: "p-2 rounded-full hover:bg-white/10 text-white"
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};