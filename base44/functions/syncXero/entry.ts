import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { action, data } = await req.json();

    // Get Xero credentials from secrets
    const clientId = Deno.env.get("XERO_CLIENT_ID");
    const clientSecret = Deno.env.get("XERO_CLIENT_SECRET");
    const tenantId = Deno.env.get("XERO_TENANT_ID");
    let refreshToken = Deno.env.get("XERO_REFRESH_TOKEN");

    if (!clientId || !clientSecret || !tenantId) {
      return Response.json({ 
        error: 'Xero credentials not configured. Please set XERO_CLIENT_ID, XERO_CLIENT_SECRET, and XERO_TENANT_ID in secrets.',
        success: false 
      }, { status: 400 });
    }

    // OAuth 2.0 token management
    const getAccessToken = async () => {
      const tokenResponse = await fetch('https://identity.xero.com/connect/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        })
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to refresh Xero access token');
      }

      const tokenData = await tokenResponse.json();
      
      // Update refresh token if provided
      if (tokenData.refresh_token) {
        refreshToken = tokenData.refresh_token;
        // Note: In production, save new refresh token to secrets
      }

      return tokenData.access_token;
    };

    const accessToken = await getAccessToken();

    // Xero API base URL
    const baseUrl = 'https://api.xero.com/api.xro/2.0';

    // Handle different actions
    switch (action) {
      case 'sync_chart_of_accounts': {
        // Fetch chart of accounts from Xero
        const response = await fetch(`${baseUrl}/Accounts`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch chart of accounts from Xero');
        }

        const xeroData = await response.json();
        const accounts = xeroData.Accounts || [];

        // Map Xero accounts to Premiso format
        const mappedAccounts = accounts.map(account => ({
          account_code: account.Code,
          account_name: account.Name,
          account_type: account.Type,
          xero_account_id: account.AccountID,
          status: account.Status,
          description: account.Description,
          class: account.Class,
          system_account: account.SystemAccount
        }));

        // Store in Premiso (you could create an AccountingAccount entity)
        return Response.json({
          success: true,
          message: `Synced ${mappedAccounts.length} accounts from Xero`,
          accounts: mappedAccounts,
          sync_date: new Date().toISOString()
        });
      }

      case 'sync_bank_transactions': {
        // Fetch bank transactions from Xero
        const response = await fetch(`${baseUrl}/BankTransactions`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch bank transactions from Xero');
        }

        const xeroData = await response.json();
        const transactions = xeroData.BankTransactions || [];

        // Map to Premiso format
        const mappedTransactions = transactions.map(tx => ({
          transaction_id: tx.BankTransactionID,
          reference: tx.Reference,
          date: tx.Date,
          amount: tx.Total,
          type: tx.Type,
          status: tx.Status,
          line_items: tx.LineItems?.map(item => ({
            description: item.Description,
            quantity: item.Quantity,
            unit_amount: item.UnitAmount,
            account_code: item.AccountCode
          })),
          contact: tx.Contact?.Name,
          xero_synced: true
        }));

        return Response.json({
          success: true,
          message: `Synced ${mappedTransactions.length} bank transactions from Xero`,
          transactions: mappedTransactions,
          sync_date: new Date().toISOString()
        });
      }

      case 'sync_invoices': {
        // Fetch invoices from Xero
        const response = await fetch(`${baseUrl}/Invoices`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch invoices from Xero');
        }

        const xeroData = await response.json();
        const invoices = xeroData.Invoices || [];

        // Map to Premiso format
        const mappedInvoices = invoices.map(inv => ({
          invoice_id: inv.InvoiceID,
          invoice_number: inv.InvoiceNumber,
          reference: inv.Reference,
          date: inv.Date,
          due_date: inv.DueDate,
          amount: inv.Total,
          amount_paid: inv.AmountPaid,
          amount_due: inv.AmountDue,
          status: inv.Status,
          type: inv.Type,
          contact: {
            name: inv.Contact?.Name,
            email: inv.Contact?.EmailAddress
          },
          line_items: inv.LineItems?.map(item => ({
            description: item.Description,
            quantity: item.Quantity,
            unit_amount: item.UnitAmount,
            account_code: item.AccountCode,
            tax_rate: item.TaxType
          })),
          xero_synced: true
        }));

        return Response.json({
          success: true,
          message: `Synced ${mappedInvoices.length} invoices from Xero`,
          invoices: mappedInvoices,
          sync_date: new Date().toISOString()
        });
      }

      case 'push_invoice_to_xero': {
        // Create invoice in Xero from Premiso data
        const invoiceData = data;

        const xeroInvoice = {
          Invoices: [{
            Type: invoiceData.type || 'ACCREC',
            Contact: {
              Name: invoiceData.contact_name
            },
            LineAmountTypes: invoiceData.tax_inclusive ? 'Inclusive' : 'Exclusive',
            Date: invoiceData.date,
            DueDate: invoiceData.due_date,
            InvoiceNumber: invoiceData.invoice_number,
            Reference: invoiceData.reference,
            LineItems: (invoiceData.line_items || []).map(item => ({
              Description: item.description,
              Quantity: item.quantity || 1,
              UnitAmount: item.unit_amount,
              AccountCode: item.account_code,
              TaxType: item.tax_type || 'OUTPUT'
            })),
            Status: invoiceData.status || 'DRAFT'
          }]
        };

        const response = await fetch(`${baseUrl}/Invoices`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(xeroInvoice)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.Elements?.[0]?.ValidationErrors?.[0]?.Message || 'Failed to create invoice in Xero');
        }

        const result = await response.json();

        return Response.json({
          success: true,
          message: 'Invoice created in Xero successfully',
          xero_invoice_id: result.Invoices?.[0]?.InvoiceID,
          invoice_number: result.Invoices?.[0]?.InvoiceNumber,
          status: result.Invoices?.[0]?.Status
        });
      }

      case 'reconcile_bank_transaction': {
        // Reconcile a bank transaction in Xero
        const { transaction_id, invoice_id, amount } = data;

        const reconcileData = {
          BankTransactions: [{
            Type: 'RECEIVE-PAYMENT',
            Contact: {
              Name: data.contact_name
            },
            LineAmountTypes: 'Exclusive',
            Date: data.date,
            BankAccount: {
              Code: data.bank_account_code || '012'
            },
            LineItems: [{
              Description: 'Payment reconciliation',
              Quantity: 1,
              UnitAmount: amount,
              AccountCode: data.account_code || '400'
            }]
          }]
        };

        const response = await fetch(`${baseUrl}/BankTransactions`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(reconcileData)
        });

        if (!response.ok) {
          throw new Error('Failed to reconcile transaction in Xero');
        }

        const result = await response.json();

        return Response.json({
          success: true,
          message: 'Bank transaction reconciled in Xero',
          xero_transaction_id: result.BankTransactions?.[0]?.BankTransactionID
        });
      }

      default:
        return Response.json({
          error: 'Invalid action',
          success: false
        }, { status: 400 });
    }

  } catch (error) {
    return Response.json({
      error: error.message,
      success: false
    }, { status: 500 });
  }
});