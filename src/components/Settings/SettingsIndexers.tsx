import Alert from '@app/components/Common/Alert';
import Button from '@app/components/Common/Button';
import LoadingSpinner from '@app/components/Common/LoadingSpinner';
import PageTitle from '@app/components/Common/PageTitle';
import ProwlarrModal from '@app/components/Settings/ProwlarrModal';
import globalMessages from '@app/i18n/globalMessages';
import type { ProwlarrSettings } from '@server/lib/settings';
import axios from 'axios';
import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useSWR, { mutate } from 'swr';

const messages = defineMessages({
  indexers: 'Search Indexers',
  addIndexer: 'Add Prowlarr Server',
  address: 'Address',
  error: 'Error',
});

const SettingsIndexers = () => {
  const intl = useIntl();
  const { data, error } = useSWR<ProwlarrSettings[]>('/api/v1/settings/prowlarr');
  const [modalState, setModalState] = useState<{
    open: boolean;
    indexer: ProwlarrSettings | null;
  }>({ open: false, indexer: null });

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  const revalidate = () => mutate('/api/v1/settings/prowlarr');

  return (
    <>
      <PageTitle title={intl.formatMessage(messages.indexers)} />
      <div className="mb-2 flex justify-end">
        <Button onClick={() => setModalState({ open: true, indexer: null })}>
          {intl.formatMessage(messages.addIndexer)}
        </Button>
      </div>
      {error && (
        <Alert title={intl.formatMessage(messages.error)} type="error">
          {error.message}
        </Alert>
      )}
      <ul className="space-y-4">
        {data?.map((idx) => (
          <li
            key={`indexer-${idx.id}`}
            className="flex items-center justify-between rounded-lg bg-gray-800 p-4"
          >
            <div>
              <div className="text-white">{idx.name}</div>
              <div className="text-sm text-gray-300">
                {intl.formatMessage(messages.address)}: {(idx.useSsl ? 'https://' : 'http://') + idx.hostname + ':' + idx.port}
              </div>
            </div>
            <div className="space-x-2">
              <Button
                buttonType="warning"
                onClick={() => setModalState({ open: true, indexer: idx })}
              >
                {intl.formatMessage(globalMessages.edit)}
              </Button>
              <Button
                buttonType="danger"
                onClick={async () => {
                  await axios.delete(`/api/v1/settings/prowlarr/${idx.id}`);
                  revalidate();
                }}
              >
                {intl.formatMessage(globalMessages.delete)}
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {modalState.open && (
        <ProwlarrModal
          prowlarr={modalState.indexer}
          onClose={() => setModalState({ open: false, indexer: null })}
          onSave={() => {
            setModalState({ open: false, indexer: null });
            revalidate();
          }}
        />
      )}
    </>
  );
};

export default SettingsIndexers;
