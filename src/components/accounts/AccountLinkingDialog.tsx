
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinancialData } from '@/hooks/useFinancialData';
import { type Account } from '@/types/financial';
import { Plus, Building2 } from 'lucide-react';

const AccountLinkingDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addAccount } = useFinancialData();
  
  const [formData, setFormData] = useState({
    institution_name: '',
    account_name: '',
    account_type: 'checking' as Account['account_type'],
    account_number_last4: '',
    current_balance: '0'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await addAccount({
        institution_name: formData.institution_name,
        account_name: formData.account_name,
        account_type: formData.account_type,
        account_number_encrypted: 'manual_entry', // Placeholder for manual entries
        account_number_last4: formData.account_number_last4,
        current_balance: parseFloat(formData.current_balance),
        currency_code: 'USD',
        is_active: true
      });

      // Reset form
      setFormData({
        institution_name: '',
        account_name: '',
        account_type: 'checking',
        account_number_last4: '',
        current_balance: '0'
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error linking account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-finsight-purple hover:bg-finsight-purple/90">
          <Plus className="h-4 w-4 mr-2" />
          Link Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Link Bank Account
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="institution">Bank/Institution Name</Label>
            <Input
              id="institution"
              value={formData.institution_name}
              onChange={(e) => setFormData(prev => ({ ...prev, institution_name: e.target.value }))}
              placeholder="e.g., Chase, Bank of America"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="accountName">Account Name</Label>
            <Input
              id="accountName"
              value={formData.account_name}
              onChange={(e) => setFormData(prev => ({ ...prev, account_name: e.target.value }))}
              placeholder="e.g., Primary Checking"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="accountType">Account Type</Label>
            <Select
              value={formData.account_type}
              onValueChange={(value: Account['account_type']) =>
                setFormData(prev => ({ ...prev, account_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Checking</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="credit">Credit Card</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
                <SelectItem value="loan">Loan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="last4">Last 4 Digits</Label>
            <Input
              id="last4"
              value={formData.account_number_last4}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                setFormData(prev => ({ ...prev, account_number_last4: value }));
              }}
              placeholder="1234"
              maxLength={4}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="balance">Current Balance</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              value={formData.current_balance}
              onChange={(e) => setFormData(prev => ({ ...prev, current_balance: e.target.value }))}
              placeholder="0.00"
              required
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 bg-finsight-purple hover:bg-finsight-purple/90">
              {isLoading ? 'Linking...' : 'Link Account'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AccountLinkingDialog;
