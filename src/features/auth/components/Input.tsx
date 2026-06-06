import { Input } from "@/components/ui/input";
import type { UseFormRegisterReturn } from "react-hook-form";

type InputProps = {
  type: string;
  placeholder: string;
  register: UseFormRegisterReturn<string>;
};

export default function CustomInput({
  type,
  placeholder,
  register,
}: InputProps) {
  return <Input type={type} placeholder={placeholder} {...register} />;
}
