import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { Text } from '@react-email/components';

export default function AccountLockedEmail(props: any) {
  return (
    <BaseEmailLayout previewText="AccountLockedEmail">
      <Text>This is a placeholder for AccountLockedEmail</Text>
    </BaseEmailLayout>
  );
}
