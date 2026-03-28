// RBM Brand Configuration
// Automatically loaded for RBM demo user profile

export const rbmBrand = {
  // Company Info
  name: 'RBM (North West) Limited',
  tagline: 'Proactive & transparent block management',
  
  // Color Palette (extracted from rbm-nw.co.uk)
  colors: {
    primary: '#1a3a52',        // Deep navy blue (RBM primary)
    secondary: '#2d5a8c',      // Medium blue
    accent: '#f0ad4e',         // Gold/amber accent
    success: '#28a745',        // Green
    warning: '#ffc107',        // Amber
    danger: '#dc3545',         // Red
    neutral: '#f5f5f5',        // Light gray background
    text: '#333333',           // Dark text
    textLight: '#666666',      // Medium gray text
    border: '#ddd',            // Border color
  },

  // Typography
  fonts: {
    display: "'Playfair Display', serif",  // Professional serif for headings
    body: "'Inter', sans-serif",            // Clean sans-serif for body
  },

  // Contact Information
  contact: {
    office: '29 Lee Lane, Horwich, Bolton, BL6 7AY',
    phone: '01204 924400',
    email: 'hello@rbm-nw.co.uk',
    emergencyLine: '07919 408 214',
    hours: 'Monday to Friday, 9:00am – 5:00pm',
  },

  // Team Members (from about page)
  team: [
    { name: 'Nigel Holt', role: 'Operations Manager', qualifications: 'ARLA, 30+ years experience' },
    { name: 'Nick Holt', role: 'Director', qualifications: 'BA Management & Marketing, MARLA, MNAEA' },
    { name: 'Zoe Richardson', role: 'Block Management Manager', qualifications: 'NVQ Level 3' },
    { name: 'Charlie Morris', role: 'Property Inspection Coordinator', qualifications: 'TPI Training' },
    { name: 'Rhiannon Hoyle', role: 'Block Management Administrator', qualifications: 'Customer Service' },
    { name: 'Ell Hall', role: 'Block Management Administrator', qualifications: 'TPI Level 2, Level 3 in progress' },
    { name: 'Jeanette Thompson', role: 'Block Management Advisor', qualifications: 'Industry experience' },
  ],

  // Professional Memberships
  memberships: [
    { name: 'The Property Institute (TPI)', logo: 'https://rbm-nw.co.uk/wp-content/uploads/2025/09/The-Property-Insititute-IRPM-Logo.webp' },
    { name: 'The Property Ombudsman', logo: 'https://rbm-nw.co.uk/wp-content/uploads/2025/09/Generic_TPO_Logo.webp' },
  ],

  // Company Values
  values: [
    { title: 'Transparency', description: 'Clear communication, open financial reporting, and honest advice at every stage.' },
    { title: 'Proactivity', description: 'Regular inspections, planned maintenance, and early problem-solving prevent small issues from becoming major concerns.' },
    { title: 'Tailored Service', description: 'Every development is unique, so we adapt our management plan to fit the needs of your building and residents.' },
    { title: 'Partnership Approach', description: 'We aim to build lasting relationships with leaseholders, residents, and contractors.' },
  ],

  // Services
  services: [
    { title: 'Property Management', description: 'Comprehensive building oversight, legal compliance, and contract management.' },
    { title: 'Communal Maintenance', description: 'Routine cleaning, repairs, maintenance programmes, and preventative care.' },
    { title: 'Financial Management', description: 'Service charge collection, budgeting, insurance arrangement, and financial reporting.' },
    { title: 'Health & Safety Compliance', description: 'Fire risk assessments, health & safety standards, and regulatory compliance.' },
    { title: 'Company Secretary Services', description: 'AGM organization, company secretarial duties, and statutory filing.' },
  ],

  // Custom CSS Variables for Tailwind Integration
  cssVariables: {
    '--rbm-primary': '#1a3a52',
    '--rbm-secondary': '#2d5a8c',
    '--rbm-accent': '#f0ad4e',
    '--rbm-primary-rgb': '26, 58, 82',
    '--rbm-secondary-rgb': '45, 90, 140',
    '--rbm-accent-rgb': '240, 173, 78',
  },

  // Apply theme to CSS
  applyTheme: () => {
    const root = document.documentElement;
    
    // Override Tailwind color system with RBM colors
    root.style.setProperty('--primary', '26 58 82');        // Navy blue
    root.style.setProperty('--primary-foreground', '255 255 255');
    root.style.setProperty('--secondary', '45 90 140');     // Medium blue
    root.style.setProperty('--secondary-foreground', '255 255 255');
    root.style.setProperty('--accent', '240 173 78');       // Gold
    root.style.setProperty('--accent-foreground', '26 58 82');
    root.style.setProperty('--background', '245 245 245');  // Light gray
    root.style.setProperty('--card', '255 255 255');
    
    // Add custom RBM CSS variables
    Object.entries(rbmBrand.cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Apply font overrides
    document.body.style.fontFamily = rbmBrand.fonts.body;
  },
};

export default rbmBrand;