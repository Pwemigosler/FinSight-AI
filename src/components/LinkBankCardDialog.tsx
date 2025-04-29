
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  cardNumber: z
    .string()
    .min(16, "Card number must be at least 16 digits")
    .max(19, "Card number cannot exceed 19 digits")
    .regex(/^\d+$/, "Card number must contain only digits"),
  bank: z.string().min(1, "Bank name is required"),
  cardType: z.string().min(1, "Card type is required"),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry date must be in MM/YY format"),
  cvv: z
    .string()
    .length(3, "CVV must be 3 digits")
    .regex(/^\d+$/, "CVV must contain only digits"),
  isDefault: z.boolean().default(false),
});

interface LinkBankCardDialogProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const LinkBankCardDialog: React.FC<LinkBankCardDialogProps> = ({ 
  isOpen, 
  onOpenChange 
}) => {
  const { addBankCard } = useAuth();
  const [open, setOpen] = React.useState(isOpen || false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardNumber: "",
      bank: "",
      cardType: "Debit",
      expiryDate: "",
      cvv: "",
      isDefault: false,
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange) onOpenChange(newOpen);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Extract last 4 digits for display
    const last4 = values.cardNumber.slice(-4);
    
    // Add the card to context
    addBankCard({
      last4,
      bank: values.bank,
      type: values.cardType,
      isDefault: values.isDefault,
    });
    
    // Reset form and close dialog
    form.reset();
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <CreditCard className="h-4 w-4 mr-2" />
          Link Bank Card
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Link a New Bank Card</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="1234 5678 9012 3456"
                      {...field}
                      onChange={(e) => {
                        // Remove spaces and format
                        const value = e.target.value.replace(/\s/g, "");
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bank"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Chase, Bank of America, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cardType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Type</FormLabel>
                  <FormControl>
                    <Input placeholder="Debit, Credit, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input placeholder="MM/YY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cvv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CVV</FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        maxLength={3}
                        placeholder="123" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Set as default payment method</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button type="submit">Link Card</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default LinkBankCardDialog;
