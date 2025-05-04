
import { User } from "../../types/user";
import { DefaultsService } from "./services/DefaultsService";
import { UserStorageService } from "./services/UserStorageService";
import { ProfileUpdateService } from "./services/ProfileUpdateService";
import { AuthService } from "./services/AuthService";

/**
 * Main service that coordinates user-related operations
 * Acts as a facade for the specialized services
 */
export class UserService {
  private defaultsService: DefaultsService;
  private storageService: UserStorageService;
  private profileService: ProfileUpdateService;
  private authService: AuthService;
  
  constructor() {
    this.defaultsService = new DefaultsService();
    this.storageService = new UserStorageService();
    this.profileService = new ProfileUpdateService();
    this.authService = new AuthService();
  }

  /**
   * Retrieves the stored user from localStorage
   */
  getStoredUser(): User | null {
    return this.storageService.getStoredUser();
  }

  /**
   * Updates the user profile with new values
   */
  async updateProfile(currentUser: User | null, updates: Partial<User>): Promise<User | null> {
    return this.profileService.updateProfile(currentUser, updates);
  }

  /**
   * Marks the account setup as complete
   */
  async completeAccountSetup(currentUser: User | null): Promise<User | null> {
    return this.profileService.completeAccountSetup(currentUser);
  }

  /**
   * Handles user login
   */
  async login(email: string, password: string): Promise<User | null> {
    return this.authService.login(email, password);
  }

  /**
   * Handles user signup
   */
  async signup(name: string, email: string, password: string): Promise<User | null> {
    return this.authService.signup(name, email, password);
  }

  /**
   * Logs out the user
   */
  logout(): void {
    this.authService.logout();
  }
}
