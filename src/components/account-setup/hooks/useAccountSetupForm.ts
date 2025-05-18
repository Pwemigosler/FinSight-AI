
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useProfileAvatar } from "@/hooks/profile";

type FormData = {
  fullName: string;
  address: string;
  phone: string;
  emailNotifications: boolean;
  appNotifications: boolean;
  currency: string;
  language: string;
  assistantCharacter: string;
};

type Errors = {
  fullName?: string;
  address?: string;
  phone?: string;
};

const defaultFormData: FormData = {
  fullName: "",
  address: "",
  phone: "",
  emailNotifications: true,
  appNotifications: true,
  currency: "USD",
  language: "en",
  assistantCharacter: "jarvis",
};

export const useAccountSetupForm = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const avatarHandler = useProfileAvatar();

  const validateForm = useCallback(() => {
    let newErrors: Errors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.fullName, formData.address, formData.phone]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
      
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
      
      // Clear error for the field being changed
      if (name in errors) {
        setErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[name as keyof Errors];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleInputChange(e);
      if (avatarHandler.generateAvatarFromName) {
        avatarHandler.generateAvatarFromName(e.target.value);
      }
    },
    [handleInputChange, avatarHandler]
  );

  const handleCharacterSelect = useCallback((characterId: string) => {
    setFormData((prev) => ({
      ...prev,
      assistantCharacter: characterId,
    }));
  }, []);

  const completeProfileSetup = async () => {
    if (!auth.completeAccountSetup) return false;
    
    setIsSubmitting(true);
    
    try {
      const success = await auth.completeAccountSetup({
        billingAddress: formData.address || "", // Ensure we're passing billingAddress
        phoneNumber: formData.phone || "",      // Ensure we're passing phoneNumber
      });
      
      if (success) {
        // Redirect or show success message
        navigate("/dashboard");
      }
      
      return success;
    } catch (error) {
      console.error("Error completing account setup:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (validateForm()) {
      return await completeProfileSetup();
    }
    return false;
  }, [validateForm, completeProfileSetup]);

  return {
    formData,
    errors,
    isSubmitting,
    avatarHandler,
    handleInputChange,
    handleNameChange,
    handleCharacterSelect,
    handleSubmit,
  };
};
