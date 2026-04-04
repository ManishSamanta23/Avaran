const ShieldIcon = ({ size = 32, color = "#FF6A00", strokeWidth = 3 }) => {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="8 2 48 60" 
            xmlns="http://www.w3.org/2000/svg" 
            className="logo-icon-svg"
        >
            <path d="M32 4 L10 12 V28 C10 42 20 52 32 58 C44 52 54 42 54 28 V12 Z"
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth} />

            <path d="M22 42 L32 18 L36 26 L28 26 L38 42 Z"
                fill="#E6E6E6" />
            <path d="M36 26 L44 42 L38 42 L30 26 Z"
                fill={color} />
        </svg>
    )
}

export default ShieldIcon
