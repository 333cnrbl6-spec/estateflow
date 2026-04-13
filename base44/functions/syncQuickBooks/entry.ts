import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { action, data } = await req.json();

    // Get QuickBooks credentials from secrets
    const clientId = Deno.env.get("QUICKBOOKS_CLIENT_ID");
    const clientSecret = Deno.env.get("QUICKBOOKS_CLIENT_SECRET");
    const realmId = Deno.env.get("QUICKBOOKS_REALM_ID");
    let refreshToken = Deno.env.get("QUICKBOOKS_REFRESH_TOKEN");

    if (!clientId || !clientSecret || !realmId) {
      return Response.json({ 
        error: 'QuickBooks credentials not configured. Please set QUICKBOOKS_CLIENT_ID, QUICKBOOKS_CLIENT_SECRET, and QUICKBOOKS_REALM_ID in secrets.',
        success: false 
      }, { status: 400 });
    }

    // OAuth 2.0 token management
    const getAccessToken = async () => {
      const tokenResponse = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`),
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        })
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to refresh QuickBooks access token');
      }

      const tokenData = await tokenResponse.json();
      
      if (tokenData.refresh_token) {
        refreshToken = tokenData.refresh_token;
      }

      return tokenData.access_token;
    };

    const accessToken = await getAccessToken();
    const baseUrl = `https://quickbooks.api.intuit.com/v3/company/${realmId}`;

    switch (action) {
      case 'sync_chart_of_accounts': {
        // Fetch chart of accounts from QuickBooks
        const response = await fetch(`${baseUrl}/query?query=SELECT * FROM Account`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch chart of accounts from QuickBooks');
        }

        const qbData = await response.json();
        const accounts = qbData.QueryResponse?.Account || [];

        const mappedAccounts = accounts.map(account => ({
          account_id: account.Id,
          account_name: account.Name,
          account_type: account.AccountType,
          account_sub_type: account.AccountSubType,
          classification: account.Classification,
          current_balance: account.CurrentBalance,
          active: account.Active,
          fully_qualified_name: account.FullyQualifiedName,
          qb_synced: true
        }));

        return Response.json({
          success: true,
          message: `Synced ${mappedAccounts.length} accounts from QuickBooks`,
          accounts: mappedAccounts,
          sync_date: new Date().toISOString()
        });
      }

      case 'sync_transactions': {
        // Fetch transactions (JournalEntries, Bills, Payments) from QuickBooks
        const [journalEntries, bills, payments] = await Promise.all([
          fetch(`${baseUrl}/query?query=SELECT * FROM JournalEntry STARTPOSITION 1 MAXRESULTS 100`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json'
            }
          }),
          fetch(`${baseUrl}/query?query=SELECT * FROM Bill STARTPOSITION 1 MAXRESULTS 100`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json'
            }
          }),
          fetch(`${baseUrl}/query?query=SELECT * FROM Payment STARTPOSITION 1 MAXRESULTS 100`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json'
            }
          })
        ]);

        const jeData = await journalEntries.json();
        const billsData = await bills.json();
        const paymentsData = await payments.json();

        const transactions = [];

        // Map Journal Entries
        (jeData.QueryResponse?.JournalEntry || []).forEach(je => {
          transactions.push({
            transaction_id: je.Id,
            type: 'journal_entry',
            date: je.TxnDate,
            total_amount: je.TotalAmt,
            doc_number: je.DocNumber,
            private_note: je.PrivateNote,
            lines: je.Line?.map(line => ({
              description: line.Description,
              amount: line.Amount,
              posting_type: line.PostingType,
              account_ref: line.AccountRef?.name
            })),
            qb_synced: true
          });
        });

        // Map Bills
        (billsData.QueryResponse?.Bill || []).forEach(bill => {
          transactions.push({
            transaction_id: bill.Id,
            type: 'bill',
            date: bill.TxnDate,
            due_date: bill.DueDate,
            total_amount: bill.TotalAmt,
            balance: bill.Balance,
            doc_number: bill.DocNumber,
            vendor: bill.VendorRef?.name,
            qb_synced: true
          });
        });

        // Map Payments
        (paymentsData.QueryResponse?.Payment || []).forEach(payment => {
          transactions.push({
            transaction_id: payment.Id,
            type: 'payment',
            date: payment.TxnDate,
            total_amount: payment.TotalAmt,
            private_note: payment.PrivateNote,
            customer: payment.CustomerRef?.name,
            qb_synced: true
          });
        });

        return Response.json({
          success: true,
          message: `Synced ${transactions.length} transactions from QuickBooks`,
          transactions,
          sync_date: new Date().toISOString()
        });
      }

      case 'sync_invoices': {
        const response = await fetch(`${baseUrl}/query?query=SELECT * FROM Invoice STARTPOSITION 1 MAXRESULTS 100`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch invoices from QuickBooks');
        }

        const qbData = await response.json();
        const invoices = qbData.QueryResponse?.Invoice || [];

        const mappedInvoices = invoices.map(inv => ({
          invoice_id: inv.Id,
          invoice_number: inv.DocNumber,
          date: inv.TxnDate,
          due_date: inv.DueDate,
          total_amount: inv.TotalAmt,
          balance: inv.Balance,
          status: inv.Balance > 0 ? 'unpaid' : 'paid',
          customer: {
            name: inv.CustomerRef?.name,
            id: inv.CustomerRef?.value
          },
          line_items: inv.Line?.map(line => ({
            description: line.Description,
            amount: line.Amount,
            quantity: line.Quantity,
            unit_price: line.UnitPrice,
            account_ref: line.AccountRef?.name
          })),
          qb_synced: true
        }));

        return Response.json({
          success: true,
          message: `Synced ${mappedInvoices.length} invoices from QuickBooks`,
          invoices: mappedInvoices,
          sync_date: new Date().toISOString()
        });
      }

      case 'push_invoice_to_quickbooks': {
        const invoiceData = data;

        const qbInvoice = {
          CustomerRef: {
            value: invoiceData.customer_id
          },
          TxnDate: invoiceData.date,
          DueDate: invoiceData.due_date,
          DocNumber: invoiceData.invoice_number,
          PrivateNote: invoiceData.reference,
          Line: (invoiceData.line_items || []).map(item => ({
            Description: item.description,
            Amount: item.quantity * item.unit_amount,
            Quantity: item.quantity || 1,
            UnitPrice: item.unit_amount,
            DetailType: 'SalesItemLineDetail',
            SalesItemLineDetail: {
              ItemRef: {
                value: item.item_id || '1'
              },
              AccountRef: {
                value: item.account_id || '1'
              }
            }
          })),
          TxnTaxDetail: {
            TotalTax: invoiceData.tax_amount || 0
          }
        };

        const response = await fetch(`${baseUrl}/invoice`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Robots-Tag': 'noindex'
          },
          body: JSON.stringify(qbInvoice)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.Fault?.Error?.[0]?.Detail || 'Failed to create invoice in QuickBooks');
        }

        const result = await response.json();

        return Response.json({
          success: true,
          message: 'Invoice created in QuickBooks successfully',
          quickbooks_invoice_id: result.Invoice?.Id,
          invoice_number: result.Invoice?.DocNumber,
          sync_token: result.Invoice?.SyncToken
        });
      }

      case 'push_transaction_to_quickbooks': {
        const transactionData = data;

        const qbJournalEntry = {
          TxnDate: transactionData.date,
          PrivateNote: transactionData.description,
          Adjustment: transactionData.adjustment || false,
          Line: (transactionData.lines || []).map(line => ({
            Amount: Math.abs(line.amount),
            DetailType: 'JournalEntryLineDetail',
            Description: line.description,
            JournalEntryLineDetail: {
              PostingType: line.posting_type, // Debit or Credit
              AccountRef: {
                value: line.account_id
              }
            }
          }))
        };

        const response = await fetch(`${baseUrl}/journalentry`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Robots-Tag': 'noindex'
          },
          body: JSON.stringify(qbJournalEntry)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.Fault?.Error?.[0]?.Detail || 'Failed to create transaction in QuickBooks');
        }

        const result = await response.json();

        return Response.json({
          success: true,
          message: 'Journal entry created in QuickBooks successfully',
          quickbooks_transaction_id: result.JournalEntry?.Id,
          sync_token: result.JournalEntry?.SyncToken
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