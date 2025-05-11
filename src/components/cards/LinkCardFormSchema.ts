
import * as z from "zod";

export const cardFormSchema = z.object({
  cardNumber: z
    .string()
    .min(16, "Card number must be at least 16 digits")
    .max(19, "Card number cannot exceed 19 digits")
    .regex(/^\d+$/, "Card number must contain only digits"),
  cardName: z.string().min(1, "Card name is required"),
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

export type CardFormValues = z.infer<typeof cardFormSchema>;

export const defaultCardFormValues: CardFormValues = {
  cardNumber: "",
  cardName: "",
  cardType: "Debit",
  expiryDate: "",
  cvv: "",
  isDefault: false,
};
