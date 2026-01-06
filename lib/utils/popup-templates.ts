// Placeholder popup template service - no authentication system
interface PopupTemplate {
  id: string;
  template_key: string;
  title: string;
  content: string;
  button_text: string;
  created_at: string;
  updated_at: string;
}

class PopupTemplateService {
  // Get popup template by key - placeholder implementation
  async getTemplate(templateKey: string): Promise<PopupTemplate | null> {
    console.log('getTemplate called - no authentication system');
    return null;
  }

  // Get all popup templates - placeholder implementation
  async getAllTemplates(): Promise<PopupTemplate[]> {
    console.log('getAllTemplates called - no authentication system');
    return [];
  }

  // Update popup template - placeholder implementation
  async updateTemplate(
    templateKey: string, 
    updates: Partial<Pick<PopupTemplate, 'title' | 'content' | 'button_text'>>
  ): Promise<{ success: boolean; error?: string }> {
    console.log('updateTemplate called - no authentication system');
    return { success: false, error: 'No authentication system' };
  }

  // Create new popup template - placeholder implementation
  async createTemplate(template: Omit<PopupTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: string }> {
    console.log('createTemplate called - no authentication system');
    return { success: false, error: 'No authentication system' };
  }

  // Delete popup template - placeholder implementation
  async deleteTemplate(templateKey: string): Promise<{ success: boolean; error?: string }> {
    console.log('deleteTemplate called - no authentication system');
    return { success: false, error: 'No authentication system' };
  }
}

export const popupTemplateService = new PopupTemplateService();