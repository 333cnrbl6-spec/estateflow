import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import RBMBrandingProvider from '@/components/RBMBrandingProvider';
import ErrorBoundary from '@/components/ErrorBoundary';

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
import Workflows from './pages/Workflows';
import Integrations from './pages/Integrations';
import DocumentTemplates from './pages/DocumentTemplates';
import AccountingIntegrations from './pages/AccountingIntegrations';
import FinancialReporting from './pages/FinancialReporting';
import FinancialDashboard from './pages/FinancialDashboard';
import TenantPortal from './pages/TenantPortal';
import ComplianceAudit from './pages/ComplianceAudit';
import APIIntegrationHub from './pages/APIIntegrationHub';
import ProductBrochure from './pages/ProductBrochure';
import PlatformTour from './pages/PlatformTour';
import ProductComparison from './pages/ProductComparison';
import MarketingCollateral from './pages/MarketingCollateral';
import DeveloperMarketing from './pages/DeveloperMarketing';
import BlockManagementPitch from './pages/BlockManagementPitch';
import BlockManagement from './pages/BlockManagement';
import ServiceChargeManagement from './pages/ServiceChargeManagement';
import RTMManagementPage from './pages/RTMManagementPage';
import BuildingSafetyRegister from './pages/BuildingSafetyRegister';
import BlockManagementComplianceDashboard from './pages/BlockManagementComplianceDashboard';
import DocumentAutomationEngine from './pages/DocumentAutomationEngine';
import LeaseholderPortalView from './pages/LeaseholderPortalView';
import EmergencyCalloutManager from './pages/EmergencyCalloutManager';
import DeveloperDemoSwitcher from './pages/DeveloperDemoSwitcher';
import CertificateCompliance from './pages/CertificateCompliance';
import MaintenanceWorkflow from './pages/MaintenanceWorkflow';
import OutOfHoursCallCenter from './pages/OutOfHoursCallCenter';
import CallCenterConfig from './pages/CallCenterConfig';
import OutOfHoursPricingComparison from './pages/OutOfHoursPricingComparison';
import OutOfHoursOnboarding from './pages/OutOfHoursOnboarding';
import OutOfHoursServicePipeline from './pages/OutOfHoursServicePipeline';
import OutOfHoursReporting from './pages/OutOfHoursReporting';
import ContractorMobilePortal from './pages/ContractorMobilePortal';
import BillingManagement from './pages/BillingManagement';
import OperationalMetricsDashboard from './pages/OperationalMetricsDashboard';
import VirtualCallCenterSetup from './pages/VirtualCallCenterSetup';
import SalesBrochure from './pages/SalesBrochure';
import SalesOnePageSummary from './pages/SalesOnePageSummary';
import OwnerFinancialDashboard from './pages/OwnerFinancialDashboard';
import SalesDemoSetup from './pages/SalesDemoSetup';
import ExpansionOpportunities from './pages/ExpansionOpportunities';
import DemoStation from './pages/DemoStation';
import SalesBrochureGenerator from './pages/SalesBrochureGenerator';
import SubscriberOnboarding from './pages/SubscriberOnboarding';
import DocumentRepository from './pages/DocumentRepository';
import MaintenanceBoard from './pages/MaintenanceBoard';
import LandlordPortal from './pages/LandlordPortal';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Loading Premiso...</p>
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
        <Route path="/maintenance" element={<MaintenanceWorkflow />} />
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
        <Route path="/workflows" element={<Workflows />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/document-templates" element={<DocumentTemplates />} />
        <Route path="/accounting" element={<AccountingIntegrations />} />
        <Route path="/financial-reporting" element={<FinancialDashboard />} />
        <Route path="/tenant-portal" element={<TenantPortal />} />
        <Route path="/compliance-audit" element={<ComplianceAudit />} />
        <Route path="/api-integrations" element={<APIIntegrationHub />} />
        <Route path="/developer-marketing" element={<DeveloperMarketing />} />
        <Route path="/brochure" element={<ProductBrochure />} />
        <Route path="/tour" element={<PlatformTour />} />
        <Route path="/comparison" element={<ProductComparison />} />
        <Route path="/marketing" element={<MarketingCollateral />} />
        <Route path="/block-management-pitch" element={<BlockManagementPitch />} />
        <Route path="/block-management" element={<BlockManagement />} />
        <Route path="/service-charges-management" element={<ServiceChargeManagement />} />
        <Route path="/rtm-management" element={<RTMManagementPage />} />
        <Route path="/building-safety-register" element={<BuildingSafetyRegister />} />
        <Route path="/block-compliance-dashboard" element={<BlockManagementComplianceDashboard />} />
        <Route path="/document-automation" element={<DocumentAutomationEngine />} />
        <Route path="/leaseholder-portal" element={<LeaseholderPortalView />} />
        <Route path="/emergency-callouts" element={<EmergencyCalloutManager />} />
        <Route path="/dev-demo-switcher" element={<DeveloperDemoSwitcher />} />
        <Route path="/certificate-compliance" element={<CertificateCompliance />} />
        <Route path="/out-of-hours" element={<OutOfHoursCallCenter />} />
        <Route path="/call-center-config" element={<CallCenterConfig />} />
        <Route path="/out-of-hours-pricing" element={<OutOfHoursPricingComparison />} />
        <Route path="/out-of-hours-onboarding" element={<OutOfHoursOnboarding />} />
        <Route path="/out-of-hours-pipeline" element={<OutOfHoursServicePipeline />} />
        <Route path="/out-of-hours-reporting" element={<OutOfHoursReporting />} />
        <Route path="/contractor-portal" element={<ContractorMobilePortal />} />
        <Route path="/billing" element={<BillingManagement />} />
        <Route path="/operational-metrics" element={<OperationalMetricsDashboard />} />
        <Route path="/virtual-call-center" element={<VirtualCallCenterSetup />} />
        <Route path="/sales-brochure" element={<SalesBrochure />} />
        <Route path="/sales-one-pager" element={<SalesOnePageSummary />} />
        <Route path="/owner-financials" element={<OwnerFinancialDashboard />} />
        <Route path="/sales-demo-setup" element={<SalesDemoSetup />} />
        <Route path="/expansion-opportunities" element={<ExpansionOpportunities />} />
        <Route path="/demo-station" element={<DemoStation />} />
        <Route path="/sales-brochure-generator" element={<SalesBrochureGenerator />} />
        <Route path="/onboarding" element={<SubscriberOnboarding />} />
        <Route path="/document-repository" element={<DocumentRepository />} />
        <Route path="/maintenance-board" element={<MaintenanceBoard />} />
        <Route path="/landlord-portal" element={<LandlordPortal />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <RBMBrandingProvider>
            <Router>
              <AuthenticatedApp />
            </Router>
            <Toaster />
          </RBMBrandingProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App;