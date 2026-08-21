import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { Text } from '@react-email/components';

export default function PaymentSuccessfulEmail(props: any) {
  return (
    <BaseEmailLayout previewText="PaymentSuccessfulEmail">
      <Text>This is a placeholder for PaymentSuccessfulEmail</Text>
    </BaseEmailLayout>
  );
}
