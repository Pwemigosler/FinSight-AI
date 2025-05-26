
import { useFinancialData } from '@/hooks/useFinancialData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, CreditCard, Landmark, TrendingUp, DollarSign } from 'lucide-react';

const AccountsList = () => {
  const { accounts, isLoading } = useFinancialData();

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking':
      case 'savings':
        return <Landmark className="h-5 w-5" />;
      case 'credit':
        return <CreditCard className="h-5 w-5" />;
      case 'investment':
        return <TrendingUp className="h-5 w-5" />;
      case 'loan':
        return <DollarSign className="h-5 w-5" />;
      default:
        return <Building2 className="h-5 w-5" />;
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'checking':
        return 'bg-blue-100 text-blue-800';
      case 'savings':
        return 'bg-green-100 text-green-800';
      case 'credit':
        return 'bg-orange-100 text-orange-800';
      case 'investment':
        return 'bg-purple-100 text-purple-800';
      case 'loan':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No accounts linked yet</p>
          <p className="text-sm text-gray-500">Link your first account to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {accounts.map((account) => (
        <Card key={account.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {getAccountIcon(account.account_type)}
                </div>
                <div>
                  <CardTitle className="text-lg">{account.account_name}</CardTitle>
                  <p className="text-sm text-gray-600">{account.institution_name}</p>
                </div>
              </div>
              <Badge className={getAccountTypeColor(account.account_type)}>
                {account.account_type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Balance</p>
                <p className="text-2xl font-bold">{formatBalance(account.current_balance)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Account ending in</p>
                <p className="font-mono text-lg">••••{account.account_number_last4}</p>
              </div>
            </div>
            {account.available_balance !== null && account.available_balance !== account.current_balance && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm text-gray-600">Available Balance</p>
                <p className="font-semibold">{formatBalance(account.available_balance)}</p>
              </div>
            )}
            {account.last_synced_at && (
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  Last synced: {new Date(account.last_synced_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AccountsList;
