import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { Text } from '@react-email/components';

export default function VerifyEmailEmail(props: any) {
  return (
    <BaseEmailLayout previewText="VerifyEmailEmail">
      <Text>This is a placeholder for VerifyEmailEmail</Text>
    </BaseEmailLayout>
  );
}
