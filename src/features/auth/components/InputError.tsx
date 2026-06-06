import type { FieldError } from "react-hook-form";
export default function InputError({
  error,
}: {
  error: FieldError | undefined;
}) {
  return error && <p style={{ color: "red" }}>{error.message}</p>;
}
