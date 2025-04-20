// User Event Types
export enum UserEventTypes {
  USER_REGISTERED = 'USER_REGISTERED',
  USER_PROFILE_UPDATED = 'USER_PROFILE_UPDATED',
  USER_PASSWORD_CHANGED = 'USER_PASSWORD_CHANGED',
  USER_EMAIL_VERIFIED = 'USER_EMAIL_VERIFIED',
  USER_ROLE_ASSIGNED = 'USER_ROLE_ASSIGNED',
  USER_ACCOUNT_DEACTIVATED = 'USER_ACCOUNT_DEACTIVATED',
  USER_ACCOUNT_REACTIVATED = 'USER_ACCOUNT_REACTIVATED',
  USER_PREFERENCES_UPDATED = 'USER_PREFERENCES_UPDATED',
  USER_LOGIN_PERFORMED = 'USER_LOGIN_PERFORMED',
  USER_LOGIN_FAILED = 'USER_LOGIN_FAILED'
}

// Event Payload Interfaces
export interface UserRegisteredEvent {
  userId: string;
  email: string;
  name: string;
  phone?: string;
  createdAt: string;
}

export interface UserProfileUpdatedEvent {
  userId: string;
  name?: string;
  phone?: string;
  address?: string;
  photo?: string;
  updatedAt: string;
}

export interface UserPasswordChangedEvent {
  userId: string;
  changedAt: string;
}

export interface UserEmailVerifiedEvent {
  userId: string;
  email: string;
  verifiedAt: string;
}

export interface UserRoleAssignedEvent {
  userId: string;
  role: string;
  assignedAt: string;
  assignedBy?: string;
}

export interface UserAccountDeactivatedEvent {
  userId: string;
  reason?: string;
  deactivatedAt: string;
  deactivatedBy?: string;
}

export interface UserAccountReactivatedEvent {
  userId: string;
  reactivatedAt: string;
  reactivatedBy?: string;
}

export interface UserPreferencesUpdatedEvent {
  userId: string;
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
  updatedAt: string;
}

export interface UserLoginPerformedEvent {
  userId: string;
  device?: string;
  ipAddress?: string;
  loginAt: string;
}

export interface UserLoginFailedEvent {
  email: string;
  reason: string;
  ipAddress?: string;
  attemptedAt: string;
}

// Union type of all user events
export type UserEvent =
  | UserRegisteredEvent
  | UserProfileUpdatedEvent
  | UserPasswordChangedEvent
  | UserEmailVerifiedEvent
  | UserRoleAssignedEvent
  | UserAccountDeactivatedEvent
  | UserAccountReactivatedEvent
  | UserPreferencesUpdatedEvent
  | UserLoginPerformedEvent
  | UserLoginFailedEvent;