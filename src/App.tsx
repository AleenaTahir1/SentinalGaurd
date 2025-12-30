import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { DeviceManager } from "./pages/DeviceManager";
import { SecurityLogs } from "./pages/SecurityLogs";
import { WifiPasswords } from "./pages/WifiPasswords";
import { SystemInfo } from "./pages/SystemInfo";
import { StartupPrograms } from "./pages/StartupPrograms";
import { Network } from "./pages/Network";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/devices" element={<DeviceManager />} />
          <Route path="/logs" element={<SecurityLogs />} />
          <Route path="/wifi" element={<WifiPasswords />} />
          <Route path="/system" element={<SystemInfo />} />
          <Route path="/startup" element={<StartupPrograms />} />
          <Route path="/network" element={<Network />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;



