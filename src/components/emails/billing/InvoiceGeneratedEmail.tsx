import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { Text } from '@react-email/components';

export default function InvoiceGeneratedEmail(props: any) {
  return (
    <BaseEmailLayout previewText="InvoiceGeneratedEmail">
      <Text>This is a placeholder for InvoiceGeneratedEmail</Text>
    </BaseEmailLayout>
  );
}
