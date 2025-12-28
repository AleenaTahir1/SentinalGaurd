import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { DeviceManager } from "./pages/DeviceManager";
import { SecurityLogs } from "./pages/SecurityLogs";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/devices" element={<DeviceManager />} />
          <Route path="/logs" element={<SecurityLogs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
