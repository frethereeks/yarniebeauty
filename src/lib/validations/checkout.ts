import { z } from "zod";

export const checkoutDetailsSchema = z.object({
  fullname: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(20),
  address: z.string().trim().min(5, "Enter your delivery address").max(255),
  city: z.string().trim().min(2, "Enter your city").max(100),
  state: z.string().trim().min(2, "Enter your state").max(100),
  notes: z.string().trim().max(255).optional(),
});

export type CheckoutDetailsInput = z.infer<typeof checkoutDetailsSchema>;
