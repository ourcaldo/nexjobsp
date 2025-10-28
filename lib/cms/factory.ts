import { CMSProvider } from './interface';
import { TugasCMSProvider } from './providers/tugascms';

export const getCMSProvider = (): CMSProvider => {
  const provider = process.env.CMS_PROVIDER || 'tugascms';
  
  switch (provider) {
    case 'tugascms':
      return new TugasCMSProvider();
    default:
      throw new Error(`Unknown CMS provider: ${provider}`);
  }
};
