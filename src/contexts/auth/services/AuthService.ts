
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
    try {
      return await this.authenticationService.login(email, password);
    } catch (error) {
      console.error("[AuthService] Login error:", error);
      toast.error("Login failed. Please try again.");
      return null;
    }
  }

  /**
   * Handles user signup
   */
  async signup(name: string, email: string, password: string): Promise<User | null> {
    try {
      return await this.authenticationService.signup(name, email, password);
    } catch (error) {
      console.error("[AuthService] Signup error:", error);
      toast.error("Signup failed. Please try again.");
      return null;
    }
  }

  /**
   * Logs out the user
   */
  async logout(): Promise<void> {
    try {
      await this.authenticationService.logout();
    } catch (error) {
      console.error("[AuthService] Logout error:", error);
      toast.error("Logout failed. Please try again.");
      // Don't re-throw to prevent additional error handling complexities
    }
  }

  /**
   * Handles biometric registration for a user
   */
  async registerBiometrics(user: User): Promise<boolean | {success: boolean; error?: string}> {
    try {
      return await this.biometricAuthService.registerBiometrics(user);
    } catch (error) {
      console.error("[AuthService] Register biometrics error:", error);
      return { success: false, error: "Failed to register biometrics" };
    }
  }

  /**
   * Handles login with biometrics
   */
  async loginWithBiometrics(email: string): Promise<User | null> {
    try {
      return await this.biometricAuthService.loginWithBiometrics(email);
    } catch (error) {
      console.error("[AuthService] Biometric login error:", error);
      toast.error("Biometric login failed. Please try again.");
      return null;
    }
  }

  /**
   * Removes biometric credentials for a user
   */
  async removeBiometrics(user: User): Promise<boolean> {
    try {
      return await this.biometricAuthService.removeBiometrics(user);
    } catch (error) {
      console.error("[AuthService] Remove biometrics error:", error);
      toast.error("Failed to remove biometrics. Please try again.");
      return false;
    }
  }

  /**
   * Checks if biometrics are available and registered for the user
   */
  async canUseBiometrics(user?: User | null): Promise<boolean> {
    try {
      return await this.biometricAuthService.canUseBiometrics(user);
    } catch (error) {
      console.error("[AuthService] Check biometrics error:", error);
      return false;
    }
  }
}
