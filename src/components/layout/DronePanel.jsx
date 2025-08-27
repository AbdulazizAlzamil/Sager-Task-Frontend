export default function DronePanel({ isOpen, onClose, children }) {
  return (
    <aside
      className={`
        ${isOpen ? "block" : "hidden"}
        fixed md:relative w-80 h-full bg-gray-800/95 backdrop-blur-md
        border-r border-gray-700/50 transform transition-all duration-300 ease-in-out
        z-30 md:z-auto
      `}
    >
      <div className="h-full overflow-y-auto">{children}</div>
    </aside>
  );
}
