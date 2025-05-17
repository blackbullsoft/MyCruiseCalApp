import { isIOS } from "../utils/platformUtils";

export const fontFamilies = {
    POPPINS: {
      normal: isIOS() ? 'Poppins Light' : 'poppins-latin-300-normal',
      medium: isIOS() ? 'Poppins Medium' : 'poppins-latin-500-normal',
      bold: isIOS() ? 'Poppins Bold' : 'poppins-latin-700-normal',
    }
  };