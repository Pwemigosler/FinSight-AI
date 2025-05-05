
import { useState } from 'react';
import { Target, Plus, PiggyBank, Home, Car, Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

// Mock goals data
const goalsData = [
  {
    id: 'g1',
    name: 'Emergency Fund',
    currentAmount: 5000,
    targetAmount: 10000,
    date: '2024-03-01',
    icon: <PiggyBank className="h-5 w-5" />,
    color: 'bg-finsight-blue',
    textColor: 'text-finsight-blue',
  },
  {
    id: 'g2',
    name: 'Down Payment',
    currentAmount: 12500,
    targetAmount: 50000,
    date: '2025-06-01',
    icon: <Home className="h-5 w-5" />,
    color: 'bg-finsight-purple',
    textColor: 'text-finsight-purple',
  },
  {
    id: 'g3',
    name: 'New Car',
    currentAmount: 2000,
    targetAmount: 20000,
    date: '2024-12-01',
    icon: <Car className="h-5 w-5" />,
    color: 'bg-finsight-orange',
    textColor: 'text-finsight-orange',
  },
];

// Goal icon options
const iconOptions = [
  { name: 'PiggyBank', icon: <PiggyBank className="h-5 w-5" />, color: 'bg-finsight-blue', textColor: 'text-finsight-blue' },
  { name: 'Home', icon: <Home className="h-5 w-5" />, color: 'bg-finsight-purple', textColor: 'text-finsight-purple' },
  { name: 'Car', icon: <Car className="h-5 w-5" />, color: 'bg-finsight-orange', textColor: 'text-finsight-orange' },
  { name: 'Business', icon: <Briefcase className="h-5 w-5" />, color: 'bg-finsight-green', textColor: 'text-finsight-green' },
];

const GoalTracker = () => {
  const [goals, setGoals] = useState(goalsData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    currentAmount: 0,
    targetAmount: 0,
    date: '',
    iconType: 'PiggyBank',
  });

  const calculatePercentage = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Convert to number for amount fields
    if (name === 'currentAmount' || name === 'targetAmount') {
      setNewGoal({
        ...newGoal,
        [name]: Number(value),
      });
    } else {
      setNewGoal({
        ...newGoal,
        [name]: value,
      });
    }
  };

  const handleIconChange = (value: string) => {
    setNewGoal({
      ...newGoal,
      iconType: value,
    });
  };

  const handleAddGoal = () => {
    // Validate inputs
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.date) {
      toast.error("Missing required fields", {
        description: "Please fill in all required fields."
      });
      return;
    }

    if (newGoal.targetAmount <= 0) {
      toast.error("Invalid target amount", {
        description: "Target amount must be greater than zero."
      });
      return;
    }

    if (newGoal.currentAmount < 0) {
      toast.error("Invalid current amount", {
        description: "Current amount cannot be negative."
      });
      return;
    }

    // Find selected icon
    const selectedIcon = iconOptions.find(icon => icon.name === newGoal.iconType);

    // Create new goal object
    const newGoalObj = {
      id: `g${new Date().getTime()}`,
      name: newGoal.name,
      currentAmount: newGoal.currentAmount,
      targetAmount: newGoal.targetAmount,
      date: newGoal.date,
      icon: selectedIcon?.icon || <PiggyBank className="h-5 w-5" />,
      color: selectedIcon?.color || 'bg-finsight-blue',
      textColor: selectedIcon?.textColor || 'text-finsight-blue',
    };

    // Add new goal to list
    setGoals([...goals, newGoalObj]);
    
    // Reset form and close dialog
    setNewGoal({
      name: '',
      currentAmount: 0,
      targetAmount: 0,
      date: '',
      iconType: 'PiggyBank',
    });
    setIsDialogOpen(false);
    
    // Show success toast
    toast.success("Goal added successfully", {
      description: `${newGoal.name} has been added to your goals.`
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-finsight-purple" />
            <h2 className="text-lg font-bold">Financial Goals</h2>
          </div>
          <Button size="sm" className="gap-1" onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            New Goal
          </Button>
        </div>
        
        <div className="space-y-6">
          {goals.map(goal => {
            const percentage = calculatePercentage(goal.currentAmount, goal.targetAmount);
            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`${goal.color} bg-opacity-20 p-1.5 rounded-md`}>
                      <div className={goal.textColor}>
                        {goal.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">{goal.name}</h3>
                      <p className="text-xs text-gray-500">Target: {formatDate(goal.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatAmount(goal.currentAmount)}</p>
                    <p className="text-xs text-gray-500">of {formatAmount(goal.targetAmount)}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Progress value={percentage} className="h-2 bg-gray-100" indicatorClassName={goal.color} />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{percentage}% complete</span>
                    <span>{formatAmount(goal.targetAmount - goal.currentAmount)} to go</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>

      {/* Add Goal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Goal</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Goal Name</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="e.g. New Home" 
                value={newGoal.name} 
                onChange={handleInputChange} 
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="icon">Icon</Label>
              <Select value={newGoal.iconType} onValueChange={handleIconChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((icon) => (
                    <SelectItem key={icon.name} value={icon.name}>
                      <div className="flex items-center gap-2">
                        <div className={`${icon.color} bg-opacity-20 p-1 rounded-md`}>
                          <div className={icon.textColor}>{icon.icon}</div>
                        </div>
                        <span>{icon.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="currentAmount">Current Amount ($)</Label>
                <Input 
                  id="currentAmount" 
                  name="currentAmount" 
                  type="number" 
                  placeholder="0" 
                  min="0"
                  value={newGoal.currentAmount} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="targetAmount">Target Amount ($)</Label>
                <Input 
                  id="targetAmount" 
                  name="targetAmount" 
                  type="number" 
                  placeholder="10000" 
                  min="1"
                  value={newGoal.targetAmount} 
                  onChange={handleInputChange} 
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="date">Target Date</Label>
              <Input 
                id="date" 
                name="date" 
                type="date" 
                value={newGoal.date} 
                onChange={handleInputChange} 
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddGoal}>Add Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default GoalTracker;
