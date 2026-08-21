import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { Text } from '@react-email/components';

export default function PasswordChangedEmail(props: any) {
  return (
    <BaseEmailLayout previewText="PasswordChangedEmail">
      <Text>This is a placeholder for PasswordChangedEmail</Text>
    </BaseEmailLayout>
  );
}
