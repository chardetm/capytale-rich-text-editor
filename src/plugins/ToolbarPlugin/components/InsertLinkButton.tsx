import React from 'react';
import { useContext } from 'react';
import ToolbarContext from '../../../context/ToolbarContext';
import { useTranslation } from 'react-i18next';

const InsertLinkButton = () => {
  const { isLink, insertLink } = useContext(ToolbarContext);
  const { t } = useTranslation('toolbar');

  return (
    <>
      <button
        onClick={insertLink}
        className={'toolbar-item spaced ' + (isLink ? 'active' : '')}
        aria-label={t('toolbar:insertLinkButton.Description')}
        title={t('toolbar:insertLinkButton.Description')}
        type="button"
      >
        <i className="format link" />
      </button>
    </>
  );
};

export default InsertLinkButton;
