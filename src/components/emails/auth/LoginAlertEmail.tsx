import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { Text } from '@react-email/components';

export default function LoginAlertEmail(props: any) {
  return (
    <BaseEmailLayout previewText="LoginAlertEmail">
      <Text>This is a placeholder for LoginAlertEmail</Text>
    </BaseEmailLayout>
  );
}
