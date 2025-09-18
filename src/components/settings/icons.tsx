import React from 'react'

export interface IconProps {
  className?: string
  size?: number
  color?: string
}

// Configuration Icons
export const ConfigIcon = ({ className = '', size = 16, color = 'currentColor' }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path 
      d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12S19.18 11.36 19.14 11.06L21.16 9.48C21.34 9.34 21.39 9.07 21.28 8.87L19.36 5.55C19.24 5.33 18.99 5.26 18.77 5.33L16.38 6.29C15.88 5.91 15.35 5.59 14.76 5.35L14.4 2.81C14.36 2.57 14.16 2.4 13.92 2.4H10.08C9.84 2.4 9.64 2.57 9.6 2.81L9.24 5.35C8.65 5.59 8.12 5.92 7.62 6.29L5.23 5.33C5.01 5.25 4.76 5.33 4.64 5.55L2.72 8.87C2.61 9.08 2.66 9.34 2.84 9.48L4.86 11.06C4.82 11.36 4.8 11.67 4.8 12S4.82 12.64 4.86 12.94L2.84 14.52C2.66 14.66 2.61 14.93 2.72 15.13L4.64 18.45C4.76 18.67 5.01 18.74 5.23 18.67L7.62 17.71C8.12 18.09 8.65 18.41 9.24 18.65L9.6 21.19C9.64 21.43 9.84 21.6 10.08 21.6H13.92C14.16 21.6 14.36 21.43 14.4 21.19L14.76 18.65C15.35 18.41 15.88 18.09 16.38 17.71L18.77 18.67C18.99 18.75 19.24 18.67 19.36 18.45L21.28 15.13C21.39 14.93 21.34 14.66 21.16 14.52L19.14 12.94ZM12 15.6C10.02 15.6 8.4 13.98 8.4 12S10.02 8.4 12 8.4S15.6 10.02 15.6 12S13.98 15.6 12 15.6Z" 
      fill={color} 
    />
  </svg>
)

export const CartIcon = ({ className = '', size = 16, color = 'currentColor' }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path 
      d="M7 18C5.9 18 5.01 18.9 5.01 20S5.9 22 7 22S9 21.1 9 20S8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L20.88 5H5.21L4.27 3H1ZM17 18C15.9 18 15.01 18.9 15.01 20S15.9 22 17 22S19 21.1 19 20S18.1 18 17 18Z" 
      fill={color} 
    />
  </svg>
)

export const CheckoutIcon = ({ className = '', size = 16, color = 'currentColor' }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path 
      d="M19 14H5L3 12L5 10H19L21 12L19 14ZM19 4H5C3.9 4 3 4.9 3 6V8L5 10H19L21 8V6C21 4.9 20.1 4 19 4ZM19 16H5L3 18V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V18L19 16Z" 
      fill={color} 
    />
  </svg>
)

export const MessageIcon = ({ className = '', size = 16, color = 'currentColor' }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path 
      d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" 
      fill={color} 
    />
  </svg>
)

// Display Icons
export const EyeIcon = ({ className = '', size = 16, color = 'currentColor' }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path 
      d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5S21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12S9.24 7 12 7S17 9.24 17 12S14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12S10.34 15 12 15S15 13.66 15 12S13.66 9 12 9Z" 
      fill={color} 
    />
  </svg>
)

export const CounterIcon = ({ className = '', size = 16, color = 'currentColor' }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path 
      d="M10 7V9H8V7H10ZM4 21V19H6V17H4V15H6V13H4V11H6V9H4V7H6V5H8V7H10V5H12V7H14V9H12V11H14V13H12V15H14V17H12V19H14V21H12V19H10V21H8V19H6V21H4ZM8 11V13H10V11H8ZM8 15V17H10V15H8Z" 
      fill={color} 
    />
  </svg>
)

export const ImageIcon = ({ className = '', size = 16, color = 'currentColor' }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path 
      d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" 
      fill={color} 
    />
  </svg>
)

export const CalculatorIcon = ({ className = '', size = 16, color = 'currentColor' }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path 
      d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM6.25 7.72H17.75V9.5H6.25V7.72ZM6.25 11H8.5V12.75H6.25V11ZM6.25 14.25H8.5V16H6.25V14.25ZM10.75 11H13V12.75H10.75V11ZM10.75 14.25H13V16H10.75V14.25ZM15.25 11H17.5V16H15.25V11Z" 
      fill={color} 
    />
  </svg>
)

export const TaxIcon = ({ className = '', size = 16, color = 'currentColor' }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path 
      d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM8 15.01L8.53 15.54C9.31 16.31 10.11 17.06 10.91 17.81C11.65 18.5 12.38 19.19 13.09 19.9L13.6 20.4L14.65 19.35L14.14 18.84C13.43 18.13 12.7 17.44 11.96 16.75C11.16 16 10.36 15.25 9.58 14.48L9.05 13.95L8 15.01ZM15.5 10.5C15.77 10.5 16 10.27 16 10S15.77 9.5 15.5 9.5S15 9.73 15 10S15.23 10.5 15.5 10.5ZM9.5 16.5C9.77 16.5 10 16.27 10 16S9.77 15.5 9.5 15.5S9 15.73 9 16S9.23 16.5 9.5 16.5Z" 
      fill={color} 
    />
  </svg>
)

export const ShippingIcon = ({ className = '', size = 16, color = 'currentColor' }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path 
      d="M20 8H17V4H3C1.9 4 1 4.9 1 6V17H3C3 18.66 4.34 20 6 20S9 18.66 9 17H15C15 18.66 16.34 20 18 20S21 18.66 21 17H23V12L20 8ZM6 18.5C5.17 18.5 4.5 17.83 4.5 17S5.17 15.5 6 15.5S7.5 16.17 7.5 17S6.83 18.5 6 18.5ZM19.5 9.5L21.46 12H17V9.5H19.5ZM18 18.5C17.17 18.5 16.5 17.83 16.5 17S17.17 15.5 18 15.5S19.5 16.17 19.5 17S18.83 18.5 18 18.5Z" 
      fill={color} 
    />
  </svg>
)

// Features Icons
export const SparklesIcon = ({ className = '', size = 16, color = 'currentColor' }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path 
      d="M12 1L14.09 8.26L22 7L14.09 8.26L12 1ZM12 1L9.91 8.26L2 7L9.91 8.26L12 1ZM12 23L9.91 15.74L2 17L9.91 15.74L12 23ZM12 23L14.09 15.74L22 17L14.09 15.74L12 23ZM1 12L8.26 9.91L7 2L8.26 9.91L1 12ZM23 12L15.74 9.91L17 2L15.74 9.91L23 12ZM1 12L8.26 14.09L7 22L8.26 14.09L1 12ZM23 12L15.74 14.09L17 22L15.74 14.09L23 12Z" 
      fill={color} 
    />
  </svg>
)

export const CouponIcon = ({ className = '', size = 16, color = 'currentColor' }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path 
      d="M21 3H3C1.9 3 1 3.9 1 5V11C2.1 11 3 11.9 3 13S2.1 15 1 15V21C1 22.1 1.9 23 3 23H21C22.1 23 23 22.1 23 21V15C21.9 15 21 14.1 21 13S21.9 11 23 11V5C23 3.9 22.1 3 21 3ZM21 10.54C19.76 11.1 19 12.42 19 13.5C19 14.58 19.76 15.9 21 16.46V21H3V16.46C4.24 15.9 5 14.58 5 13.5C5 12.42 4.24 11.1 3 10.54V5H21V10.54ZM9 8L15 14L13.59 15.41L9 10.83L6.41 13.41L5 12L9 8Z" 
      fill={color} 
    />
  </svg>
)

export const EditIcon = ({ className = '', size = 16, color = 'currentColor' }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path 
      d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" 
      fill={color} 
    />
  </svg>
)

export const HeartIcon = ({ className = '', size = 16, color = 'currentColor' }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path 
      d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" 
      fill={color} 
    />
  </svg>
)

// Dimensions Icons
export const RulerIcon = ({ className = '', size = 16, color = 'currentColor' }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path 
      d="M3 17H21V19H3V17ZM3 5V7H21V5H3ZM3 13H21V15H3V13ZM3 9H21V11H3V9Z" 
      fill={color} 
    />
  </svg>
)

export const WidthIcon = ({ className = '', size = 16, color = 'currentColor' }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path 
      d="M9 7L5 11L9 15V12H15V15L19 11L15 7V10H9V7Z" 
      fill={color} 
    />
  </svg>
)

export const HeightIcon = ({ className = '', size = 16, color = 'currentColor' }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path 
      d="M7 9V5L11 9H8V15H11L7 19V15H4V9H7ZM17 15V19L13 15H16V9H13L17 5V9H20V15H17Z" 
      fill={color} 
    />
  </svg>
)

// Group Icons (for setting groups)
export const GroupIcon = ({ className = '', size = 16, color = 'currentColor' }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path 
      d="M16 4C18.21 4 20 5.79 20 8S18.21 12 16 12S12 10.21 12 8S13.79 4 16 4ZM16 14C20.42 14 24 15.79 24 18V20H8V18C8 15.79 11.58 14 16 14ZM8 12C10.21 12 12 10.21 12 8S10.21 4 8 4S4 5.79 4 8S5.79 12 8 12ZM8 14C3.58 14 0 15.79 0 18V20H8V18C8 16.9 8.89 15.89 10.07 15.21C9.39 14.47 8.74 14 8 14Z" 
      fill={color} 
    />
  </svg>
)

export const BugIcon = ({ className = '', size = 16, color = 'currentColor' }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path 
      d="M14 12H10V10H14M14 16H10V14H14M20 8H17.19C16.74 7.22 16.12 6.55 15.37 6.04L17 4.41L15.59 3L13.42 5.17C12.96 5.06 12.49 5 12 5S11.04 5.06 10.59 5.17L8.41 3L7 4.41L8.62 6.04C7.88 6.55 7.26 7.22 6.81 8H4V10H6.09C6.04 10.33 6 10.66 6 11V12H4V14H6V15C6 15.34 6.04 15.67 6.09 16H4V18H6.81C7.85 19.79 9.78 21 12 21S16.15 19.79 17.19 18H20V16H17.91C17.96 15.67 18 15.34 18 15V14H20V12H18V11C18 10.66 17.96 10.33 17.91 10H20V8Z" 
      fill={color} 
    />
  </svg>
)