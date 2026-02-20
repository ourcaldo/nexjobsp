import { CMSProvider } from './interface';
import { TugasCMSProvider } from './providers/tugascms';

let instance: CMSProvider | null = null;

/**
 * Get the CMS provider singleton.
 * NOTE [M-14]: Currently only 'tugascms' is supported.
 * The factory/switch pattern is retained for future multi-provider support.
 */
export const getCMSProvider = (): CMSProvider => {
  if (instance) return instance;

  const provider = process.env.CMS_PROVIDER || 'tugascms';
  
  switch (provider) {
    case 'tugascms':
      instance = new TugasCMSProvider();
      return instance;
    default:
      throw new Error(`Unknown CMS provider: ${provider}`);
  }
};
