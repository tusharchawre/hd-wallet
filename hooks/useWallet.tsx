import { useState, useEffect, useCallback } from 'react';


// Types
interface WalletState {
  isLocked: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
}

interface StorageAdapter {
  set(key: string, value: any): Promise<void>;
  get(key: string): Promise<any>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

// Chrome Extension Storage Adapter
class ChromeStorageAdapter implements StorageAdapter {
  async set(key: string, value: any): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.set({ [key]: value }, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
    }
    throw new Error('Chrome storage not available');
  }

  async get(key: string): Promise<any> {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], (result) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(result[key]);
          }
        });
      });
    }
    throw new Error('Chrome storage not available');
  }

  async remove(key: string): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.remove([key], () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
    }
    throw new Error('Chrome storage not available');
  }

  async clear(): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.clear(() => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
    }
    throw new Error('Chrome storage not available');
  }
}

// Development Storage Adapter (fallback)
class DevStorageAdapter implements StorageAdapter {
  async set(key: string, value: any): Promise<void> {
    console.warn('Using localStorage for development - NOT SECURE for production');
    localStorage.setItem(key, JSON.stringify(value));
  }

  async get(key: string): Promise<any> {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : undefined;
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    localStorage.clear();
  }
}

// Crypto utilities (simplified - use proper crypto library in production)
class CryptoUtils {
  static async hashPassword(password: string, salt: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  static async deriveKey(password: string, salt: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode(salt),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  static async encrypt(data: string, key: CryptoKey): Promise<{ encrypted: string; iv: string }> {
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(data)
    );

    return {
      encrypted: Array.from(new Uint8Array(encrypted))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''),
      iv: Array.from(iv)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    };
  }

  static async decrypt(encryptedData: string, iv: string, key: CryptoKey): Promise<string> {
    const decoder = new TextDecoder();
    const encrypted = new Uint8Array(
      encryptedData.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );
    const ivArray = new Uint8Array(
      iv.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivArray },
      key,
      encrypted
    );

    return decoder.decode(decrypted);
  }

  static generateSalt(): string {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(salt)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

// Storage keys
const STORAGE_KEYS = {
  PASSWORD_HASH: 'wallet_password_hash',
  PASSWORD_SALT: 'wallet_password_salt',
  ENCRYPTED_SEED: 'wallet_encrypted_seed',
  SEED_IV: 'wallet_seed_iv',
  SEED_SALT: 'wallet_seed_salt',
  WALLET_CONFIG: 'wallet_config'
};

// Main hook
export const useWalletStorage = () => {
  const [state, setState] = useState<WalletState>({
    isLocked: true,
    isInitialized: false,
    isLoading: true,
    error: null
  });

  // Storage adapter - automatically detects environment
  const storage: StorageAdapter = typeof chrome !== 'undefined' && chrome.storage 
    ? new ChromeStorageAdapter() 
    : new DevStorageAdapter();

  // Current session encryption key (cleared on lock)
  const [sessionKey, setSessionKey] = useState<CryptoKey | null>(null);

  // Check if wallet is initialized
  const checkInitialization = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const passwordHash = await storage.get(STORAGE_KEYS.PASSWORD_HASH);
      const isInitialized = !!passwordHash;
      
      setState(prev => ({ 
        ...prev, 
        isInitialized, 
        isLoading: false,
        isLocked: isInitialized // If initialized, start locked
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to check initialization',
        isLoading: false 
      }));
    }
  }, [storage]);

  // Initialize wallet with password and seed phrase
  const initializeWallet = useCallback(async (password: string, seedPhrase: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Generate salts
      const passwordSalt = CryptoUtils.generateSalt();
      const seedSalt = CryptoUtils.generateSalt();

      // Hash password for storage
      const passwordHash = await CryptoUtils.hashPassword(password, passwordSalt);

      // Derive encryption key and encrypt seed
      const encryptionKey = await CryptoUtils.deriveKey(password, seedSalt);
      const { encrypted, iv } = await CryptoUtils.encrypt(seedPhrase, encryptionKey);

      // Store everything
      await storage.set(STORAGE_KEYS.PASSWORD_HASH, passwordHash);
      await storage.set(STORAGE_KEYS.PASSWORD_SALT, passwordSalt);
      await storage.set(STORAGE_KEYS.ENCRYPTED_SEED, encrypted);
      await storage.set(STORAGE_KEYS.SEED_IV, iv);
      await storage.set(STORAGE_KEYS.SEED_SALT, seedSalt);

      // Set session key and unlock
      setSessionKey(encryptionKey);
      setState(prev => ({ 
        ...prev, 
        isInitialized: true, 
        isLocked: false, 
        isLoading: false 
      }));

      return true;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to initialize wallet',
        isLoading: false 
      }));
      return false;
    }
  }, [storage]);

  // Unlock wallet with password
  const unlockWallet = useCallback(async (password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Get stored password hash and salt
      const [storedHash, passwordSalt] = await Promise.all([
        storage.get(STORAGE_KEYS.PASSWORD_HASH),
        storage.get(STORAGE_KEYS.PASSWORD_SALT)
      ]);

      if (!storedHash || !passwordSalt) {
        throw new Error('Wallet not initialized');
      }

      // Verify password
      const passwordHash = await CryptoUtils.hashPassword(password, passwordSalt);
      if (passwordHash !== storedHash) {
        throw new Error('Invalid password');
      }

      // Derive encryption key
      const seedSalt = await storage.get(STORAGE_KEYS.SEED_SALT);
      const encryptionKey = await CryptoUtils.deriveKey(password, seedSalt);

      // Set session key and unlock
      setSessionKey(encryptionKey);
      setState(prev => ({ ...prev, isLocked: false, isLoading: false }));

      return true;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to unlock wallet',
        isLoading: false 
      }));
      return false;
    }
  }, [storage]);

  // Lock wallet
  const lockWallet = useCallback(() => {
    setSessionKey(null);
    setState(prev => ({ ...prev, isLocked: true, error: null }));
  }, []);

  // Get decrypted seed phrase (only when unlocked)
  const getSeedPhrase = useCallback(async (): Promise<string | null> => {
    if (!sessionKey || state.isLocked) {
      throw new Error('Wallet is locked');
    }

    try {
      const [encryptedSeed, iv] = await Promise.all([
        storage.get(STORAGE_KEYS.ENCRYPTED_SEED),
        storage.get(STORAGE_KEYS.SEED_IV)
      ]);

      if (!encryptedSeed || !iv) {
        throw new Error('Seed phrase not found');
      }

      return await CryptoUtils.decrypt(encryptedSeed, iv, sessionKey);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to get seed phrase'
      }));
      return null;
    }
  }, [sessionKey, state.isLocked, storage]);

  // Clear all wallet data
  const clearWallet = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await storage.clear();
      setSessionKey(null);
      
      setState({
        isLocked: true,
        isInitialized: false,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to clear wallet',
        isLoading: false 
      }));
    }
  }, [storage]);

  // Check initialization on mount
  useEffect(() => {
    let mounted = true;
    
    const initCheck = async () => {
      if (mounted) {
        await checkInitialization();
      }
    };
    
    initCheck();
    
    return () => {
      mounted = false;
    };
  }, []); // Remove checkInitialization from dependency array

  // Auto-lock after inactivity (optional)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (!state.isLocked && sessionKey) {
      timeoutId = setTimeout(() => {
        lockWallet();
      }, 15 * 60 * 1000); // 15 minutes
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [state.isLocked, sessionKey, lockWallet]);

  return {
    // State
    ...state,
    
    // Actions
    initializeWallet,
    unlockWallet,
    lockWallet,
    getSeedPhrase,
    clearWallet,
    
    // Utilities
    checkInitialization
  };
};