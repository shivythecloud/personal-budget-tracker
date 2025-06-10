const Input = ({ label, error, ...props }) => (
  <div>
    {label && <label className="block font-medium">{label}</label>}
    <input {...props} className={`border p-2 rounded w-full ${error ? 'border-red-500' : ''}`} />
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
);
export default Input;




