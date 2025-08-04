import Alert from '@app/components/Common/Alert';
import Button from '@app/components/Common/Button';
import LoadingSpinner from '@app/components/Common/LoadingSpinner';
import PageTitle from '@app/components/Common/PageTitle';
import QbittorrentModal from '@app/components/Settings/QbittorrentModal';
import globalMessages from '@app/i18n/globalMessages';
import type { QbittorrentSettings } from '@server/lib/settings';
import axios from 'axios';
import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useSWR, { mutate } from 'swr';

const messages = defineMessages({
  clients: 'Download Client',
  addClient: 'Add qBittorrent Server',
  address: 'Address',
  error: 'Error',
});

const SettingsDownloadClient = () => {
  const intl = useIntl();
  const { data, error } = useSWR<QbittorrentSettings[]>(
    '/api/v1/settings/qbittorrent'
  );
  const [modalState, setModalState] = useState<{
    open: boolean;
    client: QbittorrentSettings | null;
  }>({ open: false, client: null });

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  const revalidate = () => mutate('/api/v1/settings/qbittorrent');

  return (
    <>
      <PageTitle title={intl.formatMessage(messages.clients)} />
      <div className="mb-2 flex justify-end">
        <Button onClick={() => setModalState({ open: true, client: null })}>
          {intl.formatMessage(messages.addClient)}
        </Button>
      </div>
      {error && (
        <Alert title={intl.formatMessage(messages.error)} type="error">
          {error.message}
        </Alert>
      )}
      <ul className="space-y-4">
        {data?.map((cl) => (
          <li
            key={`client-${cl.id}`}
            className="flex items-center justify-between rounded-lg bg-gray-800 p-4"
          >
            <div>
              <div className="text-white">{cl.name}</div>
              <div className="text-sm text-gray-300">
                {intl.formatMessage(messages.address)}: {(cl.useSsl ? 'https://' : 'http://') + cl.hostname + ':' + cl.port}
              </div>
            </div>
            <div className="space-x-2">
              <Button
                buttonType="warning"
                onClick={() => setModalState({ open: true, client: cl })}
              >
                {intl.formatMessage(globalMessages.edit)}
              </Button>
              <Button
                buttonType="danger"
                onClick={async () => {
                  await axios.delete(`/api/v1/settings/qbittorrent/${cl.id}`);
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
        <QbittorrentModal
          client={modalState.client}
          onClose={() => setModalState({ open: false, client: null })}
          onSave={() => {
            setModalState({ open: false, client: null });
            revalidate();
          }}
        />
      )}
    </>
  );
};

export default SettingsDownloadClient;
