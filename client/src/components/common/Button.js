const Button = ({ children, className = '', ...props }) => (
  <button {...props} className={`bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 ${className}`}>
    {children}
  </button>
);
export default Button;




