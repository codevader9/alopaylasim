interface AvatarProps {
  src?: string | null
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function Avatar({
  src,
  name,
  size = 'md',
  className = '',
}: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeMap[size]} rounded-full object-cover ${className}`}
      />
    )
  }

  return (
    <div
      className={`
        ${sizeMap[size]} rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400
        flex items-center justify-center font-semibold ${className}
      `}
    >
      {getInitials(name)}
    </div>
  )
}
