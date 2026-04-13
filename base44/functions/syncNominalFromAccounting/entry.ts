import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { company_id, accounting_package, xero_connection, sage_connection, quickbooks_connection } = payload;

    if (!company_id || !accounting_package) {
      return Response.json({ error: 'Missing company_id or accounting_package' }, { status: 400 });
    }

    let chartOfAccounts = [];

    // Sync from Xero
    if (accounting_package === 'xero' && xero_connection) {
      try {
        const xeroAccounts = await syncFromXero(base44, xero_connection);
        chartOfAccounts = xeroAccounts;
      } catch (err) {
        console.error('Xero sync error:', err);
        return Response.json({ error: `Xero sync failed: ${err.message}` }, { status: 500 });
      }
    }

    // Sync from Sage
    if (accounting_package === 'sage' && sage_connection) {
      try {
        const sageAccounts = await syncFromSage(base44, sage_connection);
        chartOfAccounts = sageAccounts;
      } catch (err) {
        console.error('Sage sync error:', err);
        return Response.json({ error: `Sage sync failed: ${err.message}` }, { status: 500 });
      }
    }

    // Sync from QuickBooks
    if (accounting_package === 'quickbooks' && quickbooks_connection) {
      try {
        const qbAccounts = await syncFromQuickBooks(base44, quickbooks_connection);
        chartOfAccounts = qbAccounts;
      } catch (err) {
        console.error('QuickBooks sync error:', err);
        return Response.json({ error: `QuickBooks sync failed: ${err.message}` }, { status: 500 });
      }
    }

    if (chartOfAccounts.length === 0) {
      return Response.json({ error: 'No accounts found' }, { status: 400 });
    }

    // Prepare Nominal records for bulk creation/update
    const nominalRecords = chartOfAccounts.map(account => mapToNominal(account, company_id, accounting_package));

    // Check for existing accounts by code to avoid duplicates
    const existingCodes = new Set();
    const existingNominals = await base44.entities.Nominal.filter({ company_id });
    existingNominals.forEach(n => existingCodes.add(n.account_code));

    // Filter out duplicates
    const newRecords = nominalRecords.filter(r => !existingCodes.has(r.account_code));
    
    if (newRecords.length === 0) {
      return Response.json({
        success: true,
        message: `All ${nominalRecords.length} accounts already exist`,
        accounts_synced: 0,
        accounts_skipped: nominalRecords.length,
      });
    }

    // Bulk create only new Nominal records
    const created = await base44.entities.Nominal.bulkCreate(newRecords);

    return Response.json({
      success: true,
      message: `Synced ${created.length} new accounts from ${accounting_package} (${nominalRecords.length - created.length} duplicates skipped)`,
      accounts_synced: created.length,
      accounts_skipped: nominalRecords.length - created.length,
      total_in_system: existingNominals.length + created.length,
      sample_accounts: created.slice(0, 3),
    });
  } catch (error) {
    console.error('Sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function syncFromXero(base44, xeroConnection) {
  // Xero API call to get Chart of Accounts
  const { accessToken } = xeroConnection;
  
  const response = await fetch('https://api.xero.com/api.xro/2.0/Accounts', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Xero API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  return (data.Accounts || []).map(account => ({
    account_code: account.Code,
    account_name: account.Name,
    account_type: mapXeroTypeToInternal(account.Type),
    xero_mapping: {
      xero_code: account.Code,
      xero_account_id: account.AccountID,
      xero_account_name: account.Name,
      xero_account_type: account.Type,
      xero_tax_type: account.TaxType,
      last_synced: new Date().toISOString(),
    },
    description: account.Description || '',
    status: account.Status === 'ACTIVE' ? 'active' : 'inactive',
    is_bank_account: account.Type === 'BANK',
    is_payable_account: account.Type === 'PAYABLE',
    is_receivable_account: account.Type === 'RECEIVABLE',
  }));
}

async function syncFromSage(base44, sageConnection) {
  // Sage API call to get Chart of Accounts
  const { accessToken } = sageConnection;
  
  const response = await fetch('https://api.columbus.sage.com/v3.1/accounts', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Sage API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  return (data.accounts || []).map(account => ({
    account_code: account.code,
    account_name: account.name,
    account_type: mapSageTypeToInternal(account.type),
    sage_mapping: {
      sage_code: account.code,
      sage_account_id: account.id,
      sage_account_name: account.name,
      sage_cost_code: account.cost_code || '',
      sage_tax_code: account.tax_code || '',
      last_synced: new Date().toISOString(),
    },
    description: account.description || '',
    status: account.status === 'Active' ? 'active' : 'inactive',
    is_bank_account: account.type === 'Bank',
    is_payable_account: account.type === 'Payable',
    is_receivable_account: account.type === 'Receivable',
  }));
}

async function syncFromQuickBooks(base44, qbConnection) {
  // QuickBooks API call to get Chart of Accounts
  const { accessToken, realmId } = qbConnection;
  
  const query = "SELECT * FROM Account";
  const response = await fetch(`https://quickbooks.api.intuit.com/v2/company/${realmId}/query?query=${encodeURIComponent(query)}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`QuickBooks API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  return (data.QueryResponse?.Account || []).map(account => ({
    account_code: account.AccountNumber || account.Name.substring(0, 4),
    account_name: account.Name,
    account_type: mapQBTypeToInternal(account.AccountType),
    quickbooks_mapping: {
      quickbooks_account_number: account.AccountNumber || '',
      quickbooks_account_id: account.Id,
      quickbooks_account_name: account.Name,
      quickbooks_account_type: account.AccountType,
      quickbooks_account_subtype: account.AccountSubType || '',
      quickbooks_tax_code: account.TaxCodeRef?.value || '',
      last_synced: new Date().toISOString(),
    },
    description: account.Description || '',
    status: account.Active ? 'active' : 'inactive',
    is_bank_account: account.AccountType === 'Bank',
    is_payable_account: account.AccountType === 'CreditCard' || account.Name.toLowerCase().includes('payable'),
    is_receivable_account: account.AccountType === 'Accounts Receivable',
  }));
}

function mapToNominal(account, company_id, package_name) {
  const base = {
    company_id,
    ...account,
  };

  // Add package-specific mapping fields
  if (package_name === 'xero') {
    base.account_category = mapXeroTypeToCategory(account.xero_mapping.xero_account_type);
  } else if (package_name === 'sage') {
    base.account_category = mapSageTypeToCategory(account.sage_mapping.sage_code);
  } else if (package_name === 'quickbooks') {
    base.account_category = mapQBTypeToCategory(account.quickbooks_mapping.quickbooks_account_type);
  }

  return base;
}

function mapXeroTypeToInternal(xeroType) {
  const mapping = {
    'ASSET': 'asset',
    'LIABILITY': 'liability',
    'EQUITY': 'equity',
    'INCOME': 'income',
    'EXPENSE': 'expense',
    'PAYABLE': 'liability',
    'RECEIVABLE': 'asset',
    'BANK': 'asset',
    'CREDIT_CARD': 'liability',
    'SALES': 'income',
    'COST_OF_SALES': 'cost_of_sales',
  };
  return mapping[xeroType] || 'expense';
}

function mapSageTypeToInternal(sageType) {
  const mapping = {
    'Bank': 'asset',
    'Fixed Asset': 'asset',
    'Current Asset': 'asset',
    'Stock': 'asset',
    'Debtors': 'asset',
    'Creditors': 'liability',
    'Sales': 'income',
    'Purchases': 'expense',
    'Overheads': 'expense',
    'Direct Costs': 'cost_of_sales',
  };
  return mapping[sageType] || 'expense';
}

function mapQBTypeToInternal(qbType) {
  const mapping = {
    'Asset': 'asset',
    'Liability': 'liability',
    'Equity': 'equity',
    'Income': 'income',
    'Expense': 'expense',
    'Bank': 'asset',
    'CreditCard': 'liability',
    'Other Current Asset': 'asset',
    'Fixed Asset': 'asset',
    'Other Asset': 'asset',
  };
  return mapping[qbType] || 'expense';
}

function mapXeroTypeToCategory(xeroType) {
  const mapping = {
    'BANK': 'current_asset',
    'CURRENT_ASSET': 'current_asset',
    'FIXED_ASSET': 'fixed_asset',
    'LIABILITY': 'current_liability',
    'EQUITY': 'capital_and_reserves',
    'SALES': 'sales_revenue',
    'EXPENSE': 'administrative_expenses',
    'COST_OF_SALES': 'cost_of_goods_sold',
  };
  return mapping[xeroType] || 'other_expenses';
}

function mapSageTypeToCategory(sageCode) {
  // Sage typically uses 4-digit codes with ranges
  const code = parseInt(sageCode);
  if (code < 2000) return 'current_asset';
  if (code < 3000) return 'current_liability';
  if (code < 4000) return 'capital_and_reserves';
  if (code < 5000) return 'sales_revenue';
  if (code < 6000) return 'cost_of_goods_sold';
  return 'administrative_expenses';
}

function mapQBTypeToCategory(qbType) {
  const mapping = {
    'Asset': 'current_asset',
    'Bank': 'current_asset',
    'Other Current Asset': 'current_asset',
    'Fixed Asset': 'fixed_asset',
    'Other Asset': 'current_asset',
    'Liability': 'current_liability',
    'Equity': 'capital_and_reserves',
    'Income': 'sales_revenue',
    'Expense': 'administrative_expenses',
  };
  return mapping[qbType] || 'other_expenses';
}