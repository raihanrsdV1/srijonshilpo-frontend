import React from 'react'
import {
  ConfigIcon, CartIcon, CheckoutIcon, MessageIcon, EyeIcon, CounterIcon,
  ImageIcon, CalculatorIcon, TaxIcon, ShippingIcon, SparklesIcon,
  CouponIcon, EditIcon, HeartIcon, RulerIcon, WidthIcon, HeightIcon,
  GroupIcon, BugIcon
} from './icons'

export interface SettingIconProps {
  icon: string
  className?: string
  size?: number
  color?: string
}

const iconMap = {
  config: ConfigIcon,
  cart: CartIcon,
  checkout: CheckoutIcon,
  message: MessageIcon,
  eye: EyeIcon,
  counter: CounterIcon,
  image: ImageIcon,
  calculator: CalculatorIcon,
  tax: TaxIcon,
  shipping: ShippingIcon,
  sparkles: SparklesIcon,
  coupon: CouponIcon,
  edit: EditIcon,
  heart: HeartIcon,
  ruler: RulerIcon,
  width: WidthIcon,
  height: HeightIcon,
  group: GroupIcon,
  bug: BugIcon
}

export const SettingIcon: React.FC<SettingIconProps> = ({ 
  icon, 
  className = '', 
  size = 16, 
  color = 'currentColor' 
}) => {
  const IconComponent = iconMap[icon as keyof typeof iconMap]
  
  if (!IconComponent) {
    // Fallback to a generic config icon
    return <ConfigIcon className={className} size={size} color={color} />
  }
  
  return <IconComponent className={className} size={size} color={color} />
}

export default SettingIcon