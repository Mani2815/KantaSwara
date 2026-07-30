import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { Text } from '@react-email/components';

export default function QAApprovedEmail(props: any) {
  return (
    <BaseEmailLayout previewText="QAApprovedEmail">
      <Text>This is a placeholder for QAApprovedEmail</Text>
    </BaseEmailLayout>
  );
}
