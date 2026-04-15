import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import RBMBrandingProvider from '@/components/RBMBrandingProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import { RoleProvider } from '@/lib/RoleContext';
import ErrorToastContainer from '@/components/ErrorToastContainer';

import Landing from './pages/Landing';
import FounderLaunch from './pages/FounderLaunch';
import AppLayout from './components/layout/AppLayout';
import RouteErrorBoundary from './components/RouteErrorBoundary';
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
import CompaniesHouseProfiles from './pages/CompaniesHouseProfiles';
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
import TenantMaintenancePortal from './pages/TenantMaintenancePortal';
import VendorManagement from './pages/VendorManagement';
import VendorSelfService from './pages/VendorSelfService';
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
import SubscriberIntelligentOnboarding from './pages/SubscriberIntelligentOnboarding';
import SalesTargetedDemoBuilder from './pages/SalesTargetedDemoBuilder';
import DocumentRepository from './pages/DocumentRepository';
import PropertyDocumentManager from './pages/PropertyDocumentManager';
import MaintenanceBoard from './pages/MaintenanceBoard';
import LandlordPortal from './pages/LandlordPortal';
import BankReconciliation from './pages/BankReconciliation';
import LandlordReportingDashboard from './pages/LandlordReportingDashboard';
import MessagesAdmin from './pages/MessagesAdmin';
import MaintenanceReports from './pages/MaintenanceReports';
import SalesDashboard from './pages/SalesDashboard';
import MarketReports from './pages/MarketReports';
import BuyerPortal from './pages/BuyerPortal';
import Viewings from './pages/Viewings';
import AgentPerformanceDashboard from './pages/AgentPerformanceDashboard';
import ComplianceDashboard2 from './pages/ComplianceDashboard2';
import BulkImportTester from './pages/BulkImportTester';
import UserTypeManager from './pages/UserTypeManager';
import PropertyKPIDashboard from './pages/PropertyKPIDashboard';
import ContractorPortal from './pages/ContractorPortal';
import PropertyInspection from './pages/PropertyInspection';
import MaintenanceAnalyticsDashboard from './pages/MaintenanceAnalyticsDashboard';
import LandlordMonthlyReporting from './pages/LandlordMonthlyReporting';
import ContractorDashboard from './pages/ContractorDashboard';
import TenantSelfServicePortal from './pages/TenantSelfServicePortal';
import Settings from './pages/Settings';
import FinancialReportingModule from './pages/FinancialReportingModule';
import ComplianceHub from './pages/ComplianceHub';
import FinancialReconciliation from './pages/FinancialReconciliation';
import Billing from './pages/Billing';
import ErrorMonitoring from './pages/ErrorMonitoring';
import CertificateManagement from './pages/CertificateManagement';
import RoleDashboard from './pages/RoleDashboard';
import ContractorPortalMobile from './pages/ContractorPortalMobile';
import DocumentationViewer from './pages/DocumentationViewer';
import CustomizableFinancialReports from './pages/CustomizableFinancialReports';
import DetailedComplianceReports from './pages/DetailedComplianceReports';
import InvoiceManagement from './pages/InvoiceManagement';
import TenantPortalEnhancedPage from './pages/TenantPortalEnhancedPage';
import PropertyManagerDashboard from './pages/PropertyManagerDashboard';
import PropertyInspectionGenerator from './pages/PropertyInspectionGenerator';
import ContractorScheduling from './pages/ContractorScheduling';
import HMODashboard from './pages/HMODashboard';
import ComplianceRiskAnalytics from './pages/ComplianceRiskAnalytics';
import TenantCompliancePortal from './pages/TenantCompliancePortal';
import ComplianceWorkflowAutomation from './pages/ComplianceWorkflowAutomation';
import MaintenanceForecasting from './pages/MaintenanceForecasting';
import TenantCommunicationPortal from './pages/TenantCommunicationPortal';
import TenantScreening from './pages/TenantScreening';
import TenantPortalDedicated from './pages/TenantPortalDedicated';
import TenantPaymentPortal from './pages/TenantPaymentPortal';
import OwnerPortal from './pages/OwnerPortal';
import MaintenanceWorkflowManager from './pages/MaintenanceWorkflowManager';
import TaskManagement from './pages/TaskManagement';
import CertificateComplianceTracking from './pages/CertificateComplianceTracking';
import BusinessRelationshipCompliance from './pages/BusinessRelationshipCompliance';
import OnboardingWorkflowHub from './pages/OnboardingWorkflowHub';
import ComplianceNotificationCenter from './pages/ComplianceNotificationCenter';
import MaintenanceSchedulingDashboard from './pages/MaintenanceSchedulingDashboard';
import LegalComplianceFramework from './pages/LegalComplianceFramework';
import AddPropertyWizard from './pages/AddPropertyWizard';
import RelationshipIntelligence from './pages/RelationshipIntelligence';
import BackupManagement from './pages/BackupManagement';
import PerformanceMetricsDashboard from './pages/PerformanceMetricsDashboard';
import DeveloperDocuments from './pages/DeveloperDocuments';
import DocumentUploadHub from './pages/DocumentUploadHub';
import DataDiscoveryHub from './pages/DataDiscoveryHub';
import MaintenanceRequestTimelines from './pages/MaintenanceRequestTimelines';

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
      {/* ── Sidebar-wrapped authenticated pages ─────────────────────────── */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<RouteErrorBoundary><Dashboard /></RouteErrorBoundary>} />

        {/* Core */}
        <Route path="/companies" element={<Companies />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/add" element={<AddPropertyWizard />} />
        <Route path="/units" element={<Units />} />
        <Route path="/tenants" element={<Tenants />} />
        <Route path="/contacts" element={<Contacts />} />

        {/* For Sale */}
        <Route path="/sales" element={<SalesDashboard />} />
        <Route path="/viewings" element={<Viewings />} />
        <Route path="/agent-performance" element={<AgentPerformanceDashboard />} />
        <Route path="/market-reports" element={<MarketReports />} />
        <Route path="/buyer-portal" element={<BuyerPortal />} />

        {/* To Let */}
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/rent-ledger" element={<RentLedger />} />
        <Route path="/tenant-portal" element={<TenantPortal />} />
        <Route path="/tenant-screening" element={<TenantScreening />} />

        {/* Finance */}
        <Route path="/financials" element={<Financials />} />
        <Route path="/financial-reporting" element={<FinancialDashboard />} />
        <Route path="/financial-reports" element={<FinancialReportingModule />} />
        <Route path="/banking" element={<Banking />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/service-charges" element={<ServiceCharges />} />
        <Route path="/ground-rent" element={<GroundRent />} />
        <Route path="/owner-financials" element={<OwnerFinancialDashboard />} />
        <Route path="/owner-portal" element={<OwnerPortal />} />
        <Route path="/bank-reconciliation" element={<BankReconciliation />} />
        <Route path="/reconciliation" element={<FinancialReconciliation />} />
        <Route path="/accounting" element={<AccountingIntegrations />} />

        {/* Block Management */}
        <Route path="/block-management" element={<BlockManagement />} />
        <Route path="/service-charges-management" element={<ServiceChargeManagement />} />
        <Route path="/rtm-management" element={<RTMManagementPage />} />
        <Route path="/building-safety-register" element={<BuildingSafetyRegister />} />
        <Route path="/block-compliance-dashboard" element={<BlockManagementComplianceDashboard />} />
        <Route path="/document-automation" element={<DocumentAutomationEngine />} />
        <Route path="/leaseholder-portal" element={<LeaseholderPortalView />} />

        {/* Operations */}
        <Route path="/maintenance" element={<MaintenanceWorkflow />} />
        <Route path="/maintenance-board" element={<RouteErrorBoundary><MaintenanceBoard /></RouteErrorBoundary>} />
        <Route path="/maintenance-timelines" element={<MaintenanceRequestTimelines />} />
        <Route path="/maintenance-reports" element={<MaintenanceReports />} />
        <Route path="/property-manager-dashboard" element={<PropertyManagerDashboard />} />
        <Route path="/contractor-scheduling" element={<ContractorScheduling />} />
        <Route path="/maintenance-scheduling" element={<MaintenanceSchedulingDashboard />} />
        <Route path="/legal-compliance-framework" element={<LegalComplianceFramework />} />
        <Route path="/relationship-intelligence" element={<RouteErrorBoundary><RelationshipIntelligence /></RouteErrorBoundary>} />
        <Route path="/backup-management" element={<BackupManagement />} />
        <Route path="/performance-metrics" element={<PerformanceMetricsDashboard />} />
        <Route path="/developer-documents" element={<DeveloperDocuments />} />
        <Route path="/document-upload-hub" element={<DocumentUploadHub />} />
        <Route path="/maintenance-analytics" element={<MaintenanceAnalyticsDashboard />} />
        <Route path="/maintenance-forecasting" element={<MaintenanceForecasting />} />
        <Route path="/maintenance-workflow-manager" element={<MaintenanceWorkflowManager />} />
        <Route path="/tasks" element={<TaskManagement />} />
        <Route path="/certificate-compliance" element={<CertificateComplianceTracking />} />
        <Route path="/business-relationship-compliance" element={<BusinessRelationshipCompliance />} />
        <Route path="/emergency-callouts" element={<EmergencyCalloutManager />} />
        <Route path="/compliance" element={<Compliance />} />
        <Route path="/certificates" element={<CertificateManagement />} />
        <Route path="/certificate-management" element={<CertificateCompliance />} />
        <Route path="/role-dashboard" element={<RoleDashboard />} />
        <Route path="/compliance-audit" element={<ComplianceAudit />} />
        <Route path="/compliance-hub" element={<RouteErrorBoundary><ComplianceHub /></RouteErrorBoundary>} />
        <Route path="/compliance-risk-analytics" element={<ComplianceRiskAnalytics />} />
        <Route path="/compliance-workflow-automation" element={<ComplianceWorkflowAutomation />} />
        <Route path="/compliance-notification-center" element={<ComplianceNotificationCenter />} />
        <Route path="/compliance-dashboard-2" element={<ComplianceDashboard2 />} />
        <Route path="/regulatory-hub" element={<RegulatoryHub />} />
        <Route path="/companies-house-profiles" element={<CompaniesHouseProfiles />} />
        <Route path="/document-repository" element={<DocumentRepository />} />
        <Route path="/property-documents" element={<PropertyDocumentManager />} />
        <Route path="/data-discovery" element={<DataDiscoveryHub />} />
        <Route path="/workflows" element={<Workflows />} />
        <Route path="/onboarding-workflows" element={<OnboardingWorkflowHub />} />
        <Route path="/crm" element={<CRM />} />
        <Route path="/messages" element={<MessagesAdmin />} />

        {/* Out-of-Hours */}
        <Route path="/out-of-hours" element={<OutOfHoursCallCenter />} />
        <Route path="/out-of-hours-pipeline" element={<OutOfHoursServicePipeline />} />
        <Route path="/out-of-hours-reporting" element={<OutOfHoursReporting />} />
        <Route path="/call-center-config" element={<CallCenterConfig />} />
        <Route path="/out-of-hours-pricing" element={<OutOfHoursPricingComparison />} />
        <Route path="/out-of-hours-onboarding" element={<OutOfHoursOnboarding />} />
        <Route path="/contractor-portal" element={<ContractorMobilePortal />} />
        <Route path="/virtual-call-center" element={<VirtualCallCenterSetup />} />

        {/* Admin */}
        <Route path="/land-registry" element={<LandRegistry />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/api-integrations" element={<APIIntegrationHub />} />
        <Route path="/document-templates" element={<DocumentTemplates />} />
        <Route path="/landlord-portal" element={<LandlordPortal />} />
        <Route path="/reporting" element={<LandlordReportingDashboard />} />
        <Route path="/monthly-reports" element={<LandlordMonthlyReporting />} />
        <Route path="/financial-reports" element={<CustomizableFinancialReports />} />
        <Route path="/compliance-reports" element={<DetailedComplianceReports />} />
        <Route path="/invoices" element={<InvoiceManagement />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/billing-legacy" element={<BillingManagement />} />
        <Route path="/errors" element={<ErrorMonitoring />} />
        <Route path="/operational-metrics" element={<OperationalMetricsDashboard />} />
        <Route path="/kpi-dashboard" element={<PropertyKPIDashboard />} />
        <Route path="/bulk-import-tester" element={<BulkImportTester />} />
        <Route path="/user-type-manager" element={<UserTypeManager />} />
        <Route path="/dev-demo-switcher" element={<DeveloperDemoSwitcher />} />

        {/* Demo & Sales */}
        <Route path="/demo-station" element={<DemoStation />} />
        <Route path="/sales-demo-setup" element={<SalesDemoSetup />} />
        <Route path="/sales-brochure-generator" element={<SalesBrochureGenerator />} />
        <Route path="/sales-targeted-demo-builder" element={<SalesTargetedDemoBuilder />} />
        <Route path="/expansion-opportunities" element={<ExpansionOpportunities />} />
        <Route path="/onboarding" element={<SubscriberOnboarding />} />
        <Route path="/intelligent-onboarding" element={<SubscriberIntelligentOnboarding />} />

        {/* Marketing / Collateral (sidebar-wrapped so nav is present) */}
        <Route path="/sales-brochure" element={<SalesBrochure />} />
        <Route path="/sales-one-pager" element={<SalesOnePageSummary />} />
        <Route path="/brochure" element={<ProductBrochure />} />
        <Route path="/tour" element={<PlatformTour />} />
        <Route path="/comparison" element={<ProductComparison />} />
        <Route path="/marketing" element={<MarketingCollateral />} />
        <Route path="/developer-marketing" element={<DeveloperMarketing />} />
        <Route path="/block-management-pitch" element={<BlockManagementPitch />} />
        <Route path="/hmo-dashboard" element={<HMODashboard />} />
      </Route>

      {/* ── Standalone portals — no sidebar ─────────────────────────────── */}
      {/* /contractor — dedicated contractor dashboard (token-auth'd) */}
      <Route path="/contractor" element={<ContractorDashboard />} />
      {/* /contractor-view — mobile portal for contractors */}
      <Route path="/contractor-view" element={<ContractorPortal />} />
      {/* /contractor-mobile — mobile-optimized contractor portal */}
      <Route path="/contractor-mobile" element={<ContractorPortalMobile />} />
      {/* /inspection-generator — inspection report generator */}
      <Route path="/inspection-generator" element={<PropertyInspectionGenerator />} />
      {/* /inspection — standalone inspection form */}
      <Route path="/inspection-manager" element={<PropertyInspection />} />
      {/* /tenant-self-service — token-auth'd tenant self-service */}
      <Route path="/tenant-self-service" element={<TenantSelfServicePortal />} />
      {/* /tenant-portal-enhanced — enhanced tenant portal with messaging */}
      <Route path="/tenant-portal-enhanced" element={<TenantPortalEnhancedPage />} />
      <Route path="/tenant-compliance-portal" element={<TenantCompliancePortal />} />
      <Route path="/tenant-communication" element={<TenantCommunicationPortal />} />
      {/* /tenant-portal — dedicated tenant portal with maintenance, docs, announcements */}
      <Route path="/tenant-portal" element={<TenantPortalDedicated />} />
      {/* /tenant-payments — tenant payment history and receipt portal */}
      <Route path="/tenant-payments" element={<TenantPaymentPortal />} />
      {/* /tenant-maintenance — mobile tenant portal for reporting & tracking maintenance */}
      <Route path="/tenant-maintenance" element={<TenantMaintenancePortal />} />
      {/* /vendor-management — vendor/contractor management and payment tracking */}
      <Route path="/vendor-management" element={<VendorManagement />} />
      {/* /documentation — documentation viewer */}
      <Route path="/documentation" element={<DocumentationViewer />} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <RoleProvider>
            <RBMBrandingProvider>
              <Router>
                <Routes>
                  {/* Fully public — no auth check at all */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/landing" element={<Landing />} />
                  <Route path="/founder-launch" element={<FounderLaunch />} />
                  <Route path="/vendor-self-service" element={<VendorSelfService />} />
                  {/* All other routes go through auth */}
                  <Route path="/*" element={<AuthenticatedApp />} />
                </Routes>
              </Router>
              <Toaster />
              <ErrorToastContainer />
            </RBMBrandingProvider>
          </RoleProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App;