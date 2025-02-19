import { useTranslation } from 'react-i18next';
import { Picker, Item } from '@adobe/react-spectrum';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  return (
    <Picker
      selectedKey={i18n.language}
      onSelectionChange={(lang) => i18n.changeLanguage(lang)}
    >
      <Item key='en'>English</Item>
      <Item key='es'>Español</Item>
    </Picker>
  );
};

export default LanguageSelector;
