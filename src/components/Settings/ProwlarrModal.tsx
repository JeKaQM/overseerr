import Modal from '@app/components/Common/Modal';
import SensitiveInput from '@app/components/Common/SensitiveInput';
import globalMessages from '@app/i18n/globalMessages';
import type { ProwlarrSettings } from '@server/lib/settings';
import axios from 'axios';
import { Field, Formik } from 'formik';
import { useIntl, defineMessages } from 'react-intl';
import { useToasts } from 'react-toast-notifications';
import * as Yup from 'yup';

const messages = defineMessages({
  addIndexer: 'Add Prowlarr Server',
  editIndexer: 'Edit Prowlarr Server',
  servername: 'Server Name',
  hostname: 'Hostname or IP Address',
  port: 'Port',
  apiKey: 'API Key',
  ssl: 'Use SSL',
});

interface ProwlarrModalProps {
  prowlarr: ProwlarrSettings | null;
  onClose: () => void;
  onSave: () => void;
}

const ProwlarrModal = ({ prowlarr, onClose, onSave }: ProwlarrModalProps) => {
  const intl = useIntl();
  const { addToast } = useToasts();

  return (
    <Formik
      initialValues={{
        name: prowlarr?.name ?? '',
        hostname: prowlarr?.hostname ?? '',
        port: prowlarr?.port ?? 9696,
        apiKey: prowlarr?.apiKey ?? '',
        useSsl: prowlarr?.useSsl ?? false,
        baseUrl: prowlarr?.baseUrl ?? '',
      }}
      validationSchema={Yup.object({
        name: Yup.string().required('Required'),
        hostname: Yup.string().required('Required'),
        port: Yup.number().required('Required'),
        apiKey: Yup.string().required('Required'),
      })}
      onSubmit={async (values) => {
        try {
          if (prowlarr) {
            await axios.put(`/api/v1/settings/prowlarr/${prowlarr.id}`, values);
          } else {
            await axios.post('/api/v1/settings/prowlarr', values);
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
            prowlarr ? messages.editIndexer : messages.addIndexer
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
            <label htmlFor="apiKey" className="block text-sm font-medium">
              {intl.formatMessage(messages.apiKey)}
            </label>
            <Field
              id="apiKey"
              name="apiKey"
              as={SensitiveInput}
              className="w-full rounded-md border border-gray-500 bg-gray-700 p-2 text-white"
            />
            {errors.apiKey && touched.apiKey && (
              <div className="text-sm text-red-500">{errors.apiKey}</div>
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

export default ProwlarrModal;
