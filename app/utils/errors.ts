import { captureException } from "@sentry/react-native";
import { curry } from "ramda";
import { toast } from "sonner-native";

export const handleForegroundError = curry(function handleForegroundError(
  msg: string,
  error: unknown,
) {
  toast.error(msg);
  captureException(error);
});
