import logo from "../../assets/sager_logo.svg";

export default function Header() {
  return (
    <header className="h-16 border-b border-gray-700 bg-gray-800/95 backdrop-blur flex items-center justify-between px-6">
      <img src={logo} alt="Sager Drone" className="h-5 w-auto" />

      <div className="text-right">
        <div className="font-medium">Hello, Abdulaziz Alzamil</div>
        <div className="text-sm text-gray-400">Drone Operations Manager</div>
      </div>
    </header>
  );
}
