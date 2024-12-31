import { addTranslation, updateTranslation } from '@/lib/translationManager';

// Add a new translation
addTranslation('en', 'common', 'newFeature', 'New Feature');
addTranslation('hi', 'common', 'newFeature', 'नई सुविधा');
addTranslation('gu', 'common', 'newFeature', 'નવી સુવિધા');

// Update an existing translation
updateTranslation('en', 'common', 'header.title', 'Collaborative Code Platform v2');
updateTranslation('hi', 'common', 'header.title', 'सहयोगी कोड प्लेटफ़ॉर्म v2');
updateTranslation('gu', 'common', 'header.title', 'સહયોગી કોડ પ્લેટફોર્મ v2');

console.log('Translations updated successfully');
