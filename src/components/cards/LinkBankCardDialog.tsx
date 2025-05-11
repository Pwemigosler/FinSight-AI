
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { cardFormSchema, defaultCardFormValues, CardFormValues } from "./LinkCardFormSchema";
import { CardNumberInput } from "./CardNumberInput";
import { CardDetailsInputs } from "./CardDetailsInputs";

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

  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: defaultCardFormValues,
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange) onOpenChange(newOpen);
  };

  const onSubmit = (values: CardFormValues) => {
    // Add the card to context
    addBankCard({
      cardNumber: values.cardNumber,
      cardName: values.cardName,
      cardType: values.cardType,
      expiryDate: values.expiryDate,
      cvv: values.cvv,
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
            <CardNumberInput form={form} />
            <CardDetailsInputs form={form} />

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
