const RupeeIcon = ({ size = 20, className = "" }) => {
  return (
    <span
      className={`inline-flex items-center justify-center font-bold leading-none ${className}`}
      style={{
        fontSize: `${size}px`,
        lineHeight: 1,
      }}
      aria-hidden="true"
    >
      ₹
    </span>
  );
};

export default RupeeIcon;
