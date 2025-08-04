import Modal from '@app/components/Common/Modal';
import SensitiveInput from '@app/components/Common/SensitiveInput';
import globalMessages from '@app/i18n/globalMessages';
import type { QbittorrentSettings } from '@server/lib/settings';
import axios from 'axios';
import { Field, Formik } from 'formik';
import { useIntl, defineMessages } from 'react-intl';
import { useToasts } from 'react-toast-notifications';
import * as Yup from 'yup';

const messages = defineMessages({
  addClient: 'Add qBittorrent Server',
  editClient: 'Edit qBittorrent Server',
  servername: 'Server Name',
  hostname: 'Hostname or IP Address',
  port: 'Port',
  username: 'Username',
  password: 'Password',
  ssl: 'Use SSL',
});

interface QbittorrentModalProps {
  client: QbittorrentSettings | null;
  onClose: () => void;
  onSave: () => void;
}

const QbittorrentModal = ({ client, onClose, onSave }: QbittorrentModalProps) => {
  const intl = useIntl();
  const { addToast } = useToasts();

  return (
    <Formik
      initialValues={{
        name: client?.name ?? '',
        hostname: client?.hostname ?? '',
        port: client?.port ?? 8080,
        username: client?.username ?? '',
        password: client?.password ?? '',
        useSsl: client?.useSsl ?? false,
        baseUrl: client?.baseUrl ?? '',
      }}
      validationSchema={Yup.object({
        name: Yup.string().required('Required'),
        hostname: Yup.string().required('Required'),
        port: Yup.number().required('Required'),
        username: Yup.string().required('Required'),
        password: Yup.string().required('Required'),
      })}
      onSubmit={async (values) => {
        try {
          if (client) {
            await axios.put(`/api/v1/settings/qbittorrent/${client.id}`, values);
          } else {
            await axios.post('/api/v1/settings/qbittorrent', values);
          }
          addToast(intl.formatMessage(globalMessages.save), {
            appearance: 'success',
            autoDismiss: true,
          });
          onSave();
        } catch (e) {
          addToast('Failed to save', { appearance: 'error', autoDismiss: true });
        }
      }}
    >
      {({ errors, touched, isSubmitting, handleSubmit }) => (
        <Modal
          title={intl.formatMessage(
            client ? messages.editClient : messages.addClient
          )}
          onOk={() => handleSubmit()}
          onCancel={onClose}
          okDisabled={isSubmitting}
          okText={intl.formatMessage(globalMessages.save)}
          cancelText={intl.formatMessage(globalMessages.cancel)}
        >
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              {intl.formatMessage(messages.servername)}
            </label>
            <Field
              id="name"
              name="name"
              className="w-full rounded-md border border-gray-500 bg-gray-700 p-2 text-white"
            />
            {errors.name && touched.name && (
              <div className="text-sm text-red-500">{errors.name}</div>
            )}
            <label htmlFor="hostname" className="block text-sm font-medium">
              {intl.formatMessage(messages.hostname)}
            </label>
            <Field
              id="hostname"
              name="hostname"
              className="w-full rounded-md border border-gray-500 bg-gray-700 p-2 text-white"
            />
            {errors.hostname && touched.hostname && (
              <div className="text-sm text-red-500">{errors.hostname}</div>
            )}
            <label htmlFor="port" className="block text-sm font-medium">
              {intl.formatMessage(messages.port)}
            </label>
            <Field
              id="port"
              name="port"
              type="number"
              className="w-full rounded-md border border-gray-500 bg-gray-700 p-2 text-white"
            />
            {errors.port && touched.port && (
              <div className="text-sm text-red-500">{errors.port}</div>
            )}
            <label htmlFor="username" className="block text-sm font-medium">
              {intl.formatMessage(messages.username)}
            </label>
            <Field
              id="username"
              name="username"
              className="w-full rounded-md border border-gray-500 bg-gray-700 p-2 text-white"
            />
            {errors.username && touched.username && (
              <div className="text-sm text-red-500">{errors.username}</div>
            )}
            <label htmlFor="password" className="block text-sm font-medium">
              {intl.formatMessage(messages.password)}
            </label>
            <Field
              id="password"
              name="password"
              as={SensitiveInput}
              className="w-full rounded-md border border-gray-500 bg-gray-700 p-2 text-white"
            />
            {errors.password && touched.password && (
              <div className="text-sm text-red-500">{errors.password}</div>
            )}
            <div className="flex items-center space-x-2 pt-2">
              <Field type="checkbox" id="useSsl" name="useSsl" />
              <label htmlFor="useSsl" className="text-sm">
                {intl.formatMessage(messages.ssl)}
              </label>
            </div>
          </div>
        </Modal>
      )}
    </Formik>
  );
};

export default QbittorrentModal;
