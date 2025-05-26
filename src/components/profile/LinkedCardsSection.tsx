
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ManageLinkedCardsDialog from "@/components/ManageLinkedCardsDialog";
import { useAuth } from "@/contexts/auth";
import { CreditCard } from "lucide-react";

const LinkedCardsSection = () => {
  const { linkedCards } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Linked Bank Cards
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Manage your linked bank cards for payments and transactions.
          </p>
          
          {linkedCards.length > 0 ? (
            <div className="text-sm text-gray-500">
              {linkedCards.length} card{linkedCards.length !== 1 ? 's' : ''} linked
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              No cards linked yet
            </div>
          )}

          <ManageLinkedCardsDialog />
        </div>
      </CardContent>
    </Card>
  );
};

export default LinkedCardsSection;
