import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { Text } from '@react-email/components';

export default function APIKeyCreatedEmail(props: any) {
  return (
    <BaseEmailLayout previewText="APIKeyCreatedEmail">
      <Text>This is a placeholder for APIKeyCreatedEmail</Text>
    </BaseEmailLayout>
  );
}
