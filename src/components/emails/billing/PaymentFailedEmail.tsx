import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { Text } from '@react-email/components';

export default function PaymentFailedEmail(props: any) {
  return (
    <BaseEmailLayout previewText="PaymentFailedEmail">
      <Text>This is a placeholder for PaymentFailedEmail</Text>
    </BaseEmailLayout>
  );
}
