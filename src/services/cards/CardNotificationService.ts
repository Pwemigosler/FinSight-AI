
import { toast } from "sonner";

export class CardNotificationService {
  notifyCardAdded(): void {
    toast("Bank card linked successfully");
  }

  notifyCardRemoved(): void {
    toast("Bank card removed");
  }

  notifyDefaultChanged(): void {
    toast("Default payment method updated");
  }

  notifyError(action: string): void {
    toast(`Failed to ${action}`);
  }
}
