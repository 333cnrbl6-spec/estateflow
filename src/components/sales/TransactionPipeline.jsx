import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const statusStages = [
  "offer_accepted",
  "instructing_solicitors",
  "draft_contract",
  "searches_underway",
  "mortgage_application",
  "survey_completed",
  "mortgage_offer_received",
  "enquiries_raised",
  "enquiries_resolved",
  "ready_to_exchange",
  "exchange_of_contracts",
  "completion_pending",
  "completed",
  "fallen_through",
];

const statusLabels = {
  offer_accepted: "Offer Accepted",
  instructing_solicitors: "Instructing Solicitors",
  draft_contract: "Draft Contract",
  searches_underway: "Searches Underway",
  mortgage_application: "Mortgage Application",
  survey_completed: "Survey Completed",
  mortgage_offer_received: "Mortgage Offer",
  enquiries_raised: "Enquiries Raised",
  enquiries_resolved: "Enquiries Resolved",
  ready_to_exchange: "Ready to Exchange",
  exchange_of_contracts: "Exchange of Contracts",
  completion_pending: "Completion Pending",
  completed: "Completed",
  fallen_through: "Fallen Through",
};

const statusColors = {
  offer_accepted: "bg-blue-500",
  instructing_solicitors: "bg-indigo-500",
  draft_contract: "bg-purple-500",
  searches_underway: "bg-pink-500",
  mortgage_application: "bg-red-500",
  survey_completed: "bg-orange-500",
  mortgage_offer_received: "bg-yellow-500",
  enquiries_raised: "bg-amber-500",
  enquiries_resolved: "bg-lime-500",
  ready_to_exchange: "bg-green-500",
  exchange_of_contracts: "bg-emerald-500",
  completion_pending: "bg-teal-500",
  completed: "bg-cyan-500",
  fallen_through: "bg-red-600",
};

export default function TransactionPipeline({ transactions = [], isLoading }) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading pipeline...</p>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No active transactions</p>
        </CardContent>
      </Card>
    );
  }

  // Group transactions by status
  const groupedByStatus = statusStages.reduce((acc, status) => {
    acc[status] = transactions.filter(t => t.status === status);
    return acc;
  }, {});

  return (
    <ScrollArea className="h-[600px] w-full">
      <div className="grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4 min-w-max">
        {statusStages.map((stage) => (
          <div key={stage} className="space-y-3">
            <div className={`rounded-md p-3 ${statusColors[stage]} text-white`}>
              <h3 className="font-semibold text-sm">{statusLabels[stage]}</h3>
              <p className="text-xs opacity-80">{groupedByStatus[stage]?.length || 0} transactions</p>
            </div>
            <div className="space-y-2">
              {groupedByStatus[stage]?.map((transaction) => (
                <Card key={transaction.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-3">
                    <p className="font-medium text-sm truncate">
                      £{transaction.sale_price?.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {transaction.buyer_contact_id ? 'Buyer: ' + transaction.buyer_contact_id : 'Transaction'}
                    </p>
                    {transaction.target_completion_date && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        Target: {new Date(transaction.target_completion_date).toLocaleDateString()}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              )) || (
                <div className="text-center py-4 text-xs text-muted-foreground border-2 border-dashed rounded-md">
                  No transactions
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}