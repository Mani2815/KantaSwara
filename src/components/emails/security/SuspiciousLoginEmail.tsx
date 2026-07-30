import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { Text } from '@react-email/components';

export default function SuspiciousLoginEmail(props: any) {
  return (
    <BaseEmailLayout previewText="SuspiciousLoginEmail">
      <Text>This is a placeholder for SuspiciousLoginEmail</Text>
    </BaseEmailLayout>
  );
}
