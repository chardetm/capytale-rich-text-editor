import React, { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import ToolbarContext from '../../../context/ToolbarContext';
import DropdownColorPicker from '../../../ui/DropdownColorPicker';

const TextColorPicker = () => {
  const { fontColor, applyStyleText } = useContext(ToolbarContext);
  const { t } = useTranslation('toolbar');

  const onFontColorSelect = useCallback(
    (value: string) => {
      applyStyleText({ color: value });
    },
    [applyStyleText]
  );

  return (
    <DropdownColorPicker
      buttonClassName="toolbar-item color-picker"
      buttonAriaLabel={t('toolbar:textColorPicker.Description')}
      buttonIconClassName="icon font-color"
      color={fontColor}
      onChange={onFontColorSelect}
      title="text color"
    />
  );
};

export default TextColorPicker;
