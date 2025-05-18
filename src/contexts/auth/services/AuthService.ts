
import { User } from "../../../types/user";
import { toast } from "sonner";
import { AuthenticationService } from "./AuthenticationService";
import { BiometricAuthService } from "./BiometricAuthService";

/**
 * Service responsible for authentication operations
 * Acts as a facade for specialized authentication services
 */
export class AuthService {
  private authenticationService: AuthenticationService;
  private biometricAuthService: BiometricAuthService;
  
  constructor() {
    this.authenticationService = new AuthenticationService();
    this.biometricAuthService = new BiometricAuthService();
  }

  /**
   * Handles user login
   */
  async login(email: string, password: string): Promise<User | null> {
    return this.authenticationService.login(email, password);
  }

  /**
   * Handles user signup
   */
  async signup(name: string, email: string, password: string): Promise<User | null> {
    return this.authenticationService.signup(name, email, password);
  }

  /**
   * Logs out the user
   */
  logout(): void {
    return this.authenticationService.logout();
  }

  /**
   * Handles biometric registration for a user
   */
  async registerBiometrics(user: User): Promise<boolean | {success: boolean; error?: string}> {
    return this.biometricAuthService.registerBiometrics(user);
  }

  /**
   * Handles login with biometrics
   */
  async loginWithBiometrics(email: string): Promise<User | null> {
    return this.biometricAuthService.loginWithBiometrics(email);
  }

  /**
   * Removes biometric credentials for a user
   */
  async removeBiometrics(user: User): Promise<boolean> {
    return this.biometricAuthService.removeBiometrics(user);
  }

  /**
   * Checks if biometrics are available and registered for the user
   * Now properly defined as async
   */
  async canUseBiometrics(user?: User | null): Promise<boolean> {
    return this.biometricAuthService.canUseBiometrics(user);
  }
}
