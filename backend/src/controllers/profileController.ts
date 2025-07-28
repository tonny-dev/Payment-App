import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  website?: string;
  bio?: string;
  avatar?: string;
  role: 'psp' | 'dev';
  createdAt: string;
  updatedAt: string;
  preferences: {
    language: string;
    currency: string;
    timezone: string;
    theme: 'light' | 'dark' | 'system';
  };
  security: {
    twoFactorEnabled: boolean;
    biometricEnabled: boolean;
    lastLogin: string;
    loginActivity: Array<{
      device: string;
      location: string;
      timestamp: string;
      ip: string;
    }>;
  };
}

// Mock user profiles (use database in production)
const userProfiles: { [key: string]: UserProfile } = {
  user1: {
    id: 'user1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1 (555) 123-4567',
    company: 'PayTech Solutions',
    website: 'https://paytech.example.com',
    bio: 'Payment service provider focused on seamless transactions and merchant success.',
    role: 'psp',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-28T15:30:00Z',
    preferences: {
      language: 'en',
      currency: 'USD',
      timezone: 'America/New_York',
      theme: 'light',
    },
    security: {
      twoFactorEnabled: false,
      biometricEnabled: true,
      lastLogin: '2024-01-28T20:00:00Z',
      loginActivity: [
        {
          device: 'iPhone 14 Pro',
          location: 'New York, NY',
          timestamp: '2024-01-28T20:00:00Z',
          ip: '192.168.1.100',
        },
        {
          device: 'MacBook Pro',
          location: 'San Francisco, CA',
          timestamp: '2024-01-28T18:00:00Z',
          ip: '192.168.1.101',
        },
      ],
    },
  },
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const profile = userProfiles[user.id] || {
      ...userProfiles.user1,
      id: user.id,
      email: user.email,
      role: user.role,
    };

    // Remove sensitive information
    const { security, ...publicProfile } = profile;
    const sanitizedSecurity = {
      twoFactorEnabled: security.twoFactorEnabled,
      biometricEnabled: security.biometricEnabled,
      lastLogin: security.lastLogin,
      loginActivity: security.loginActivity.map(activity => ({
        device: activity.device,
        location: activity.location,
        timestamp: activity.timestamp,
        ip: activity.ip.replace(/\.\d+$/, '.***'), // Mask last octet
      })),
    };

    res.json({
      success: true,
      data: {
        ...publicProfile,
        security: sanitizedSecurity,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const updates = req.body;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Validate updates
    const allowedFields = ['firstName', 'lastName', 'phone', 'company', 'website', 'bio'];
    const filteredUpdates: any = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    // Update profile
    const currentProfile = userProfiles[user.id] || userProfiles.user1;
    const updatedProfile = {
      ...currentProfile,
      ...filteredUpdates,
      updatedAt: new Date().toISOString(),
    };

    userProfiles[user.id] = updatedProfile;

    // Remove sensitive information from response
    const { security, ...publicProfile } = updatedProfile;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: publicProfile,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const updatePreferences = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const preferences = req.body;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const currentProfile = userProfiles[user.id] || userProfiles.user1;
    const updatedProfile = {
      ...currentProfile,
      preferences: {
        ...currentProfile.preferences,
        ...preferences,
      },
      updatedAt: new Date().toISOString(),
    };

    userProfiles[user.id] = updatedProfile;

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: updatedProfile.preferences,
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
};

export const updateSecuritySettings = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const securitySettings = req.body;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const currentProfile = userProfiles[user.id] || userProfiles.user1;
    const updatedProfile = {
      ...currentProfile,
      security: {
        ...currentProfile.security,
        ...securitySettings,
      },
      updatedAt: new Date().toISOString(),
    };

    userProfiles[user.id] = updatedProfile;

    // Return sanitized security settings
    const sanitizedSecurity = {
      twoFactorEnabled: updatedProfile.security.twoFactorEnabled,
      biometricEnabled: updatedProfile.security.biometricEnabled,
    };

    res.json({
      success: true,
      message: 'Security settings updated successfully',
      data: sanitizedSecurity,
    });
  } catch (error) {
    console.error('Update security settings error:', error);
    res.status(500).json({ error: 'Failed to update security settings' });
  }
};

export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // In a real implementation, handle file upload here
    // For now, just simulate avatar upload
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`;

    const currentProfile = userProfiles[user.id] || userProfiles.user1;
    const updatedProfile = {
      ...currentProfile,
      avatar: avatarUrl,
      updatedAt: new Date().toISOString(),
    };

    userProfiles[user.id] = updatedProfile;

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatar: avatarUrl,
      },
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
};

export const exportUserData = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const profile = userProfiles[user.id] || userProfiles.user1;

    // In a real implementation, you would:
    // 1. Gather all user data from various services
    // 2. Generate a comprehensive export file
    // 3. Store it temporarily and provide download link

    const exportData = {
      profile: profile,
      exportedAt: new Date().toISOString(),
      format: 'json',
    };

    res.json({
      success: true,
      message: 'User data export initiated',
      data: exportData,
      downloadUrl: `/api/profile/download-export/${user.id}`,
    });
  } catch (error) {
    console.error('Export user data error:', error);
    res.status(500).json({ error: 'Failed to export user data' });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { confirmPassword } = req.body;

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // In a real implementation, verify password and delete all user data
    console.log('Account deletion requested for user:', user.id);

    res.json({
      success: true,
      message: 'Account deletion request received. You will receive a confirmation email within 24 hours.',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to process account deletion request' });
  }
};
