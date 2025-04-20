import { v4 as uuidv4 } from 'uuid';
import { Event, EventStore } from '../services/supabase/eventStore';
import {
  UserEventTypes,
  UserRegisteredEvent,
  UserProfileUpdatedEvent,
  UserPasswordChangedEvent,
  UserEmailVerifiedEvent,
  UserRoleAssignedEvent,
  UserAccountDeactivatedEvent,
  UserAccountReactivatedEvent,
  UserPreferencesUpdatedEvent,
  UserLoginPerformedEvent,
  UserLoginFailedEvent,
} from '../events/userEvents';

export interface UserState {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  photo?: string;
  emailVerified: boolean;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
  preferences: {
    language?: string;
    theme?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
    marketingConsent?: boolean;
  };
  createdAt: string;
  lastLoginAt?: string;
  version: number;
}

export class UserAggregate {
  private state: UserState;
  private eventStore: EventStore;
  private isLoaded: boolean = false;

  constructor(eventStore: EventStore) {
    this.eventStore = eventStore;
    this.state = this.getInitialState();
  }

  private getInitialState(): UserState {
    return {
      id: '',
      email: '',
      name: '',
      emailVerified: false,
      role: 'USER',
      status: 'ACTIVE',
      preferences: {},
      createdAt: '',
      version: 0
    };
  }

  // Load the aggregate from event history
  async load(userId: string): Promise<void> {
    if (this.isLoaded && this.state.id === userId) {
      return; // Already loaded
    }

    // Reset state
    this.state = this.getInitialState();
    
    // Try to load from snapshot first
    const snapshot = await this.eventStore.getLatestSnapshot('User', userId);
    let fromVersion = 0;
    
    if (snapshot) {
      this.state = snapshot.state as UserState;
      fromVersion = snapshot.version;
    }
    
    // Load events after the snapshot version
    const events = await this.eventStore.getEvents('User', userId, fromVersion);
    
    // Apply each event to rebuild the current state
    for (const event of events) {
      this.applyEvent(event);
    }
    
    this.isLoaded = true;
  }

  // Register a new user
  async registerUser(
    payload: {
      email: string;
      name: string;
      phone?: string;
    },
    metadata?: any
  ): Promise<string> {
    const userId = uuidv4();
    
    // Validate data
    if (!payload.email) {
      throw new Error('Email is required');
    }
    
    if (!payload.name) {
      throw new Error('Name is required');
    }
    
    // Create the event
    const event: UserRegisteredEvent = {
      userId,
      email: payload.email,
      name: payload.name,
      phone: payload.phone,
      createdAt: new Date().toISOString()
    };
    
    // Save the event
    await this.eventStore.saveEvent({
      aggregate_type: 'User',
      aggregate_id: userId,
      type: UserEventTypes.USER_REGISTERED,
      payload: event,
      metadata,
      version: 1 // First event
    });
    
    // Load the aggregate to update the state
    await this.load(userId);
    
    return userId;
  }

  // Update user profile
  async updateProfile(
    payload: {
      name?: string;
      phone?: string;
      address?: string;
      photo?: string;
    },
    metadata?: any
  ): Promise<void> {
    if (!this.isLoaded) {
      throw new Error('Aggregate not loaded');
    }
    
    // Check if there's anything to update
    if (!payload.name && !payload.phone && !payload.address && !payload.photo) {
      throw new Error('No update data provided');
    }
    
    // Create the event
    const event: UserProfileUpdatedEvent = {
      userId: this.state.id,
      name: payload.name,
      phone: payload.phone,
      address: payload.address,
      photo: payload.photo,
      updatedAt: new Date().toISOString()
    };
    
    // Save the event
    await this.eventStore.saveEvent({
      aggregate_type: 'User',
      aggregate_id: this.state.id,
      type: UserEventTypes.USER_PROFILE_UPDATED,
      payload: event,
      metadata,
      version: this.state.version + 1
    });
    
    // Refresh the aggregate
    await this.load(this.state.id);
  }

  // Change password (we don't store the actual password, just record the event)
  async changePassword(metadata?: any): Promise<void> {
    if (!this.isLoaded) {
      throw new Error('Aggregate not loaded');
    }
    
    // Create the event
    const event: UserPasswordChangedEvent = {
      userId: this.state.id,
      changedAt: new Date().toISOString()
    };
    
    // Save the event
    await this.eventStore.saveEvent({
      aggregate_type: 'User',
      aggregate_id: this.state.id,
      type: UserEventTypes.USER_PASSWORD_CHANGED,
      payload: event,
      metadata,
      version: this.state.version + 1
    });
    
    // Refresh the aggregate
    await this.load(this.state.id);
  }

  // Verify email
  async verifyEmail(metadata?: any): Promise<void> {
    if (!this.isLoaded) {
      throw new Error('Aggregate not loaded');
    }
    
    // Check if email is already verified
    if (this.state.emailVerified) {
      throw new Error('Email is already verified');
    }
    
    // Create the event
    const event: UserEmailVerifiedEvent = {
      userId: this.state.id,
      email: this.state.email,
      verifiedAt: new Date().toISOString()
    };
    
    // Save the event
    await this.eventStore.saveEvent({
      aggregate_type: 'User',
      aggregate_id: this.state.id,
      type: UserEventTypes.USER_EMAIL_VERIFIED,
      payload: event,
      metadata,
      version: this.state.version + 1
    });
    
    // Refresh the aggregate
    await this.load(this.state.id);
  }

  // Assign a role to the user
  async assignRole(
    payload: {
      role: string;
      assignedBy?: string;
    },
    metadata?: any
  ): Promise<void> {
    if (!this.isLoaded) {
      throw new Error('Aggregate not loaded');
    }
    
    // Validate role
    const validRoles = ['USER', 'RESTAURANT', 'DRIVER', 'ADMIN', 'SUPER_ADMIN'];
    if (!validRoles.includes(payload.role)) {
      throw new Error(`Invalid role: ${payload.role}. Must be one of: ${validRoles.join(', ')}`);
    }
    
    // Create the event
    const event: UserRoleAssignedEvent = {
      userId: this.state.id,
      role: payload.role,
      assignedAt: new Date().toISOString(),
      assignedBy: payload.assignedBy
    };
    
    // Save the event
    await this.eventStore.saveEvent({
      aggregate_type: 'User',
      aggregate_id: this.state.id,
      type: UserEventTypes.USER_ROLE_ASSIGNED,
      payload: event,
      metadata,
      version: this.state.version + 1
    });
    
    // Refresh the aggregate
    await this.load(this.state.id);
  }

  // Deactivate account
  async deactivateAccount(
    payload: {
      reason?: string;
      deactivatedBy?: string;
    },
    metadata?: any
  ): Promise<void> {
    if (!this.isLoaded) {
      throw new Error('Aggregate not loaded');
    }
    
    // Check if account is already inactive
    if (this.state.status === 'INACTIVE') {
      throw new Error('Account is already inactive');
    }
    
    // Create the event
    const event: UserAccountDeactivatedEvent = {
      userId: this.state.id,
      reason: payload.reason,
      deactivatedAt: new Date().toISOString(),
      deactivatedBy: payload.deactivatedBy
    };
    
    // Save the event
    await this.eventStore.saveEvent({
      aggregate_type: 'User',
      aggregate_id: this.state.id,
      type: UserEventTypes.USER_ACCOUNT_DEACTIVATED,
      payload: event,
      metadata,
      version: this.state.version + 1
    });
    
    // Refresh the aggregate
    await this.load(this.state.id);
  }

  // Reactivate account
  async reactivateAccount(
    payload: {
      reactivatedBy?: string;
    },
    metadata?: any
  ): Promise<void> {
    if (!this.isLoaded) {
      throw new Error('Aggregate not loaded');
    }
    
    // Check if account is already active
    if (this.state.status === 'ACTIVE') {
      throw new Error('Account is already active');
    }
    
    // Create the event
    const event: UserAccountReactivatedEvent = {
      userId: this.state.id,
      reactivatedAt: new Date().toISOString(),
      reactivatedBy: payload.reactivatedBy
    };
    
    // Save the event
    await this.eventStore.saveEvent({
      aggregate_type: 'User',
      aggregate_id: this.state.id,
      type: UserEventTypes.USER_ACCOUNT_REACTIVATED,
      payload: event,
      metadata,
      version: this.state.version + 1
    });
    
    // Refresh the aggregate
    await this.load(this.state.id);
  }

  // Update user preferences
  async updatePreferences(
    payload: {
      language?: string;
      theme?: string;
      notifications?: {
        email?: boolean;
        push?: boolean;
        sms?: boolean;
      };
      marketingConsent?: boolean;
    },
    metadata?: any
  ): Promise<void> {
    if (!this.isLoaded) {
      throw new Error('Aggregate not loaded');
    }
    
    // Create the event
    const event: UserPreferencesUpdatedEvent = {
      userId: this.state.id,
      preferences: payload,
      updatedAt: new Date().toISOString()
    };
    
    // Save the event
    await this.eventStore.saveEvent({
      aggregate_type: 'User',
      aggregate_id: this.state.id,
      type: UserEventTypes.USER_PREFERENCES_UPDATED,
      payload: event,
      metadata,
      version: this.state.version + 1
    });
    
    // Refresh the aggregate
    await this.load(this.state.id);
  }

  // Record a successful login
  async recordLogin(
    payload: {
      device?: string;
      ipAddress?: string;
    },
    metadata?: any
  ): Promise<void> {
    if (!this.isLoaded) {
      throw new Error('Aggregate not loaded');
    }
    
    // Create the event
    const event: UserLoginPerformedEvent = {
      userId: this.state.id,
      device: payload.device,
      ipAddress: payload.ipAddress,
      loginAt: new Date().toISOString()
    };
    
    // Save the event
    await this.eventStore.saveEvent({
      aggregate_type: 'User',
      aggregate_id: this.state.id,
      type: UserEventTypes.USER_LOGIN_PERFORMED,
      payload: event,
      metadata,
      version: this.state.version + 1
    });
    
    // Refresh the aggregate
    await this.load(this.state.id);
  }

  // Record a failed login attempt (not tied to a specific user aggregate)
  static async recordFailedLogin(
    eventStore: EventStore,
    payload: {
      email: string;
      reason: string;
      ipAddress?: string;
    },
    metadata?: any
  ): Promise<void> {
    // Create a synthetic ID for this event (not tied to a user)
    const failedLoginId = uuidv4();
    
    // Create the event
    const event: UserLoginFailedEvent = {
      email: payload.email,
      reason: payload.reason,
      ipAddress: payload.ipAddress,
      attemptedAt: new Date().toISOString()
    };
    
    // Save the event
    await eventStore.saveEvent({
      aggregate_type: 'UserLoginFailed',
      aggregate_id: failedLoginId,
      type: UserEventTypes.USER_LOGIN_FAILED,
      payload: event,
      metadata,
      version: 1
    });
  }

  // Method to apply events to the state
  private applyEvent(event: Event): void {
    const eventType = event.type;
    const payload = event.payload;
    
    switch (eventType) {
      case UserEventTypes.USER_REGISTERED:
        this.applyUserRegistered(payload as UserRegisteredEvent);
        break;
      case UserEventTypes.USER_PROFILE_UPDATED:
        this.applyUserProfileUpdated(payload as UserProfileUpdatedEvent);
        break;
      case UserEventTypes.USER_EMAIL_VERIFIED:
        this.applyUserEmailVerified(payload as UserEmailVerifiedEvent);
        break;
      case UserEventTypes.USER_ROLE_ASSIGNED:
        this.applyUserRoleAssigned(payload as UserRoleAssignedEvent);
        break;
      case UserEventTypes.USER_ACCOUNT_DEACTIVATED:
        this.applyUserAccountDeactivated(payload as UserAccountDeactivatedEvent);
        break;
      case UserEventTypes.USER_ACCOUNT_REACTIVATED:
        this.applyUserAccountReactivated(payload as UserAccountReactivatedEvent);
        break;
      case UserEventTypes.USER_PREFERENCES_UPDATED:
        this.applyUserPreferencesUpdated(payload as UserPreferencesUpdatedEvent);
        break;
      case UserEventTypes.USER_LOGIN_PERFORMED:
        this.applyUserLoginPerformed(payload as UserLoginPerformedEvent);
        break;
      // Password change doesn't affect state beyond version
    }
    
    // Update version with each event
    this.state.version = event.version;
  }

  // Apply methods for each event type
  private applyUserRegistered(event: UserRegisteredEvent): void {
    this.state.id = event.userId;
    this.state.email = event.email;
    this.state.name = event.name;
    this.state.phone = event.phone;
    this.state.createdAt = event.createdAt;
    this.state.emailVerified = false;
    this.state.role = 'USER';
    this.state.status = 'ACTIVE';
    this.state.preferences = {};
  }

  private applyUserProfileUpdated(event: UserProfileUpdatedEvent): void {
    if (event.name) this.state.name = event.name;
    if (event.phone) this.state.phone = event.phone;
    if (event.address) this.state.address = event.address;
    if (event.photo) this.state.photo = event.photo;
  }

  private applyUserEmailVerified(event: UserEmailVerifiedEvent): void {
    this.state.emailVerified = true;
  }

  private applyUserRoleAssigned(event: UserRoleAssignedEvent): void {
    this.state.role = event.role;
  }

  private applyUserAccountDeactivated(event: UserAccountDeactivatedEvent): void {
    this.state.status = 'INACTIVE';
  }

  private applyUserAccountReactivated(event: UserAccountReactivatedEvent): void {
    this.state.status = 'ACTIVE';
  }

  private applyUserPreferencesUpdated(event: UserPreferencesUpdatedEvent): void {
    this.state.preferences = {
      ...this.state.preferences,
      ...event.preferences
    };
  }

  private applyUserLoginPerformed(event: UserLoginPerformedEvent): void {
    this.state.lastLoginAt = event.loginAt;
  }

  // Get current state
  getState(): UserState {
    if (!this.isLoaded) {
      throw new Error('Aggregate not loaded');
    }
    return { ...this.state };
  }
}