import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { Text } from '@react-email/components';

export default function PasswordResetEmail(props: any) {
  return (
    <BaseEmailLayout previewText="PasswordResetEmail">
      <Text>This is a placeholder for PasswordResetEmail</Text>
    </BaseEmailLayout>
  );
}
