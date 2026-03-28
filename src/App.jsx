import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import Properties from './pages/Properties';
import Units from './pages/Units';
import Tenants from './pages/Tenants';
import Financials from './pages/Financials';
import Maintenance from './pages/Maintenance';
import Contacts from './pages/Contacts';
import Compliance from './pages/Compliance';
import Pipeline from './pages/Pipeline';
import RentLedger from './pages/RentLedger';
import ServiceCharges from './pages/ServiceCharges';
import GroundRent from './pages/GroundRent';
import Banking from './pages/Banking';
import Expenses from './pages/Expenses';
import CRM from './pages/CRM';
import LandRegistry from './pages/LandRegistry';
import Setup from './pages/Setup';
import RegulatoryHub from './pages/RegulatoryHub';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Loading Powell & Co...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/units" element={<Units />} />
        <Route path="/tenants" element={<Tenants />} />
        <Route path="/financials" element={<Financials />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/compliance" element={<Compliance />} />
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/rent-ledger" element={<RentLedger />} />
        <Route path="/service-charges" element={<ServiceCharges />} />
        <Route path="/ground-rent" element={<GroundRent />} />
        <Route path="/banking" element={<Banking />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/crm" element={<CRM />} />
        <Route path="/land-registry" element={<LandRegistry />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/regulatory-hub" element={<RegulatoryHub />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App