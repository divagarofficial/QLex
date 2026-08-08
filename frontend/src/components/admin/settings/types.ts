export type SettingsSectionId =
  | "general"
  | "platform"
  | "orders"
  | "notifications"
  | "security"
  | "integrations"
  | "appearance"
  | "advanced"
  | "about";

export interface SettingsSection {
  id: SettingsSectionId;
  label: string;
  description: string;
  iconName: string;
  badge?: string;
}

export interface GeneralSettingsState {
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  officialWebsite: string;
  timezone: string;
  currency: string;
  language: string;
}

export interface PlatformSettingsState {
  maintenanceMode: boolean; // maps to backend maintenance_mode
  maintenanceMessage: string;
  platformEnabled: boolean; // maps to backend allow_new_orders
  studentPortalEnabled: boolean;
  shopPortalEnabled: boolean;
  adminPortalEnabled: boolean;
  registrationEnabled: boolean;
  newShopRegistration: boolean;
}

export interface OrderSettingsState {
  allowPriorityOrders: boolean;
  platformFee: number; // maps to backend platform_fee
  priorityFee: number; // maps to backend priority_fee
  defaultTokenPrefix: string;
  maxUploadSizeMb: number; // maps to backend max_upload_size_mb
  maxDocumentsPerOrder: number; // maps to backend max_documents_per_order
  maxPagesPerDocument: number; // maps to backend max_pages_per_document
  draftExpiryHours: number; // maps to backend draft_expiry_hours
  queueTimeoutMinutes: number; // maps to backend queue_timeout_minutes
  allowedFileTypes: string;
  orderAutoCancelTimeMinutes: number;
  autoDeleteUploadedFiles: boolean;
  retentionPeriodDays: number;
}

export interface NotificationSettingsState {
  emailNotifications: boolean;
  whatsappNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  lowSettlementAlert: boolean;
  paymentFailureAlert: boolean;
  newShopAlert: boolean;
  orderFailureAlert: boolean;
}

export interface SecuritySettingsState {
  requireEmailVerification: boolean;
  requireOtp: boolean;
  passwordMinLength: number;
  passwordRequireSymbols: boolean;
  sessionTimeoutMinutes: number;
  jwtExpiryMinutes: number;
  maxLoginAttempts: number;
  accountLockDurationMinutes: number;
  enableAuditLogs: boolean;
}

export type IntegrationStatus = "connected" | "disconnected" | "configuration_required";

export interface IntegrationItem {
  id: string;
  name: string;
  category: string;
  description: string;
  status: IntegrationStatus;
  iconName: string;
  isBackendSupported: boolean;
  details?: Record<string, string>;
}

export interface AppearanceSettingsState {
  platformTheme: "light" | "dark" | "system";
  accentColor: string;
  logoUrl: string;
  faviconUrl: string;
}

export interface AdvancedSettingsState {
  debugMode: boolean;
  readOnlyMode: boolean;
  systemLogsStatus: string;
  apiVersion: string;
  databaseVersion: string;
  serverVersion: string;
  buildNumber: string;
  environment: string;
}

export interface AboutSectionState {
  qlexVersion: string;
  releaseChannel: string;
  lastDeployment: string;
  backendVersion: string;
  frontendVersion: string;
  copyright: string;
  license: string;
  poweredBy: string;
}

export interface FullSettingsState {
  general: GeneralSettingsState;
  platform: PlatformSettingsState;
  orders: OrderSettingsState;
  notifications: NotificationSettingsState;
  security: SecuritySettingsState;
  integrations: IntegrationItem[];
  appearance: AppearanceSettingsState;
  advanced: AdvancedSettingsState;
  about: AboutSectionState;
}
