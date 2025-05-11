
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CardFormValues } from "./LinkCardFormSchema";

interface CardNumberInputProps {
  form: UseFormReturn<CardFormValues>;
}

export const CardNumberInput: React.FC<CardNumberInputProps> = ({ form }) => {
  return (
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
  );
};
