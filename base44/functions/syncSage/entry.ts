import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { action, data } = await req.json();

    // Get Sage credentials from secrets
    const clientId = Deno.env.get("SAGE_CLIENT_ID");
    const clientSecret = Deno.env.get("SAGE_CLIENT_SECRET");
    const companyId = Deno.env.get("SAGE_COMPANY_ID");
    let refreshToken = Deno.env.get("SAGE_REFRESH_TOKEN");

    if (!clientId || !clientSecret || !companyId) {
      return Response.json({ 
        error: 'Sage credentials not configured. Please set SAGE_CLIENT_ID, SAGE_CLIENT_SECRET, and SAGE_COMPANY_ID in secrets.',
        success: false 
      }, { status: 400 });
    }

    // OAuth 2.0 token management
    const getAccessToken = async () => {
      const tokenResponse = await fetch('https://oauth.accounting.sage.com/token', {
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
        throw new Error('Failed to refresh Sage access token');
      }

      const tokenData = await tokenResponse.json();
      
      if (tokenData.refresh_token) {
        refreshToken = tokenData.refresh_token;
      }

      return tokenData.access_token;
    };

    const accessToken = await getAccessToken();
    const baseUrl = 'https://api.accounting.sage.com/v3.1';

    switch (action) {
      case 'sync_chart_of_accounts': {
        const response = await fetch(`${baseUrl}/nominal_codes`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch chart of accounts from Sage');
        }

        const sageData = await response.json();
        const accounts = sageData.$items || [];

        const mappedAccounts = accounts.map(account => ({
          account_id: account.id,
          account_code: account.code,
          account_name: account.name,
          account_type: account.type,
          parent_account_id: account.parent_account_id,
          active: account.active,
          created_at: account.created_at,
          updated_at: account.updated_at,
          sage_synced: true
        }));

        return Response.json({
          success: true,
          message: `Synced ${mappedAccounts.length} accounts from Sage`,
          accounts: mappedAccounts,
          sync_date: new Date().toISOString()
        });
      }

      case 'sync_transactions': {
        // Fetch bank transactions and journals
        const [bankTransactions, journals] = await Promise.all([
          fetch(`${baseUrl}/bank_transactions`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json'
            }
          }),
          fetch(`${baseUrl}/journals`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json'
            }
          })
        ]);

        const btData = await bankTransactions.json();
        const journalData = await journals.json();

        const transactions = [];

        // Map Bank Transactions
        ((btData.$items || [])).forEach(tx => {
          transactions.push({
            transaction_id: tx.id,
            type: 'bank_transaction',
            date: tx.date,
            amount: tx.net_amount,
            description: tx.details,
            reference: tx.reference,
            bank_account: tx.bank_account?.name,
            contact: tx.contact?.name,
            status: tx.status,
            created_at: tx.created_at,
            sage_synced: true
          });
        });

        // Map Journals
        ((journalData.$items || [])).forEach(journal => {
          transactions.push({
            transaction_id: journal.id,
            type: 'journal',
            date: journal.date,
            reference: journal.reference,
            details: journal.details,
            lines: journal.lines?.map(line => ({
              nominal_code: line.nominal_code?.code,
              amount: line.net_amount,
              tax_rate: line.tax_rate?.name,
              details: line.details
            })),
            sage_synced: true
          });
        });

        return Response.json({
          success: true,
          message: `Synced ${transactions.length} transactions from Sage`,
          transactions,
          sync_date: new Date().toISOString()
        });
      }

      case 'sync_invoices': {
        const response = await fetch(`${baseUrl}/sales_invoices`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch invoices from Sage');
        }

        const sageData = await response.json();
        const invoices = sageData.$items || [];

        const mappedInvoices = invoices.map(inv => ({
          invoice_id: inv.id,
          invoice_number: inv.invoice_number,
          date: inv.date,
          due_date: inv.due_date,
          total_amount: inv.total_amount,
          paid_amount: inv.paid_amount,
          balance: inv.outstanding_amount,
          status: inv.status,
          customer: {
            name: inv.contact?.name,
            id: inv.contact?.id
          },
          line_items: inv.lines?.map(line => ({
            description: line.details,
            quantity: line.quantity,
            unit_price: line.unit_price,
            net_amount: line.net_amount,
            tax_amount: line.tax_amount,
            nominal_code: line.nominal_code?.code
          })),
          sage_synced: true
        }));

        return Response.json({
          success: true,
          message: `Synced ${mappedInvoices.length} invoices from Sage`,
          invoices: mappedInvoices,
          sync_date: new Date().toISOString()
        });
      }

      case 'sync_financial_reports': {
        // Fetch Profit & Loss, Balance Sheet, etc.
        const [profitLoss, balanceSheet] = await Promise.all([
          fetch(`${baseUrl}/reports/profit_and_loss?from_date=${data.from_date}&to_date=${data.to_date}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json'
            }
          }),
          fetch(`${baseUrl}/reports/balance_sheet?as_at=${data.as_at_date}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json'
            }
          })
        ]);

        const plData = await profitLoss.json();
        const bsData = await balanceSheet.json();

        const reports = {
          profit_and_loss: {
            report_id: plData.id,
            generated_at: plData.generated_at,
            from_date: plData.from_date,
            to_date: plData.to_date,
            net_profit: plData.net_profit,
            sections: plData.sections?.map(section => ({
              name: section.name,
              total: section.total,
              items: section.items?.map(item => ({
                name: item.name,
                value: item.value
              }))
            }))
          },
          balance_sheet: {
            report_id: bsData.id,
            generated_at: bsData.generated_at,
            as_at_date: bsData.as_at_date,
            assets: bsData.assets,
            liabilities: bsData.liabilities,
            equity: bsData.equity
          }
        };

        return Response.json({
          success: true,
          message: 'Financial reports synced from Sage',
          reports,
          sync_date: new Date().toISOString()
        });
      }

      case 'push_invoice_to_sage': {
        const invoiceData = data;

        const sageInvoice = {
          invoice: {
            contact_id: invoiceData.contact_id,
            date: invoiceData.date,
            due_date: invoiceData.due_date,
            reference: invoiceData.reference,
            status: invoiceData.status || 'awaiting_payment',
            invoice_number: invoiceData.invoice_number,
            currency_id: invoiceData.currency_id || 'GBP',
            exchange_rate: invoiceData.exchange_rate || 1.0,
            total_amount: invoiceData.total_amount,
            total_tax_amount: invoiceData.total_tax_amount || 0,
            total_paid_amount: 0,
            lines: (invoiceData.line_items || []).map(item => ({
              description: item.description,
              quantity: item.quantity || 1,
              unit_price: item.unit_price,
              net_amount: item.net_amount,
              tax_rate_id: item.tax_rate_id,
              nominal_code_id: item.nominal_code_id
            }))
          }
        };

        const response = await fetch(`${baseUrl}/sales_invoices`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(sageInvoice)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.$errors?.[0]?.message || 'Failed to create invoice in Sage');
        }

        const result = await response.json();

        return Response.json({
          success: true,
          message: 'Invoice created in Sage successfully',
          sage_invoice_id: result.id,
          invoice_number: result.invoice_number,
          updated_at: result.updated_at
        });
      }

      case 'push_bank_transaction_to_sage': {
        const transactionData = data;

        const sageTransaction = {
          bank_transaction: {
            bank_account_id: transactionData.bank_account_id,
            contact_id: transactionData.contact_id,
            date: transactionData.date,
            reference: transactionData.reference,
            details: transactionData.details,
            net_amount: transactionData.amount,
            tax_rate_id: transactionData.tax_rate_id,
            transaction_type: transactionData.transaction_type, // credit_payment, debit_payment, credit_refund, debit_refund
            status: transactionData.status || 'approved'
          }
        };

        const response = await fetch(`${baseUrl}/bank_transactions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(sageTransaction)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.$errors?.[0]?.message || 'Failed to create bank transaction in Sage');
        }

        const result = await response.json();

        return Response.json({
          success: true,
          message: 'Bank transaction created in Sage successfully',
          sage_transaction_id: result.id,
          updated_at: result.updated_at
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