import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { Text } from '@react-email/components';

export default function MaintenanceNoticeEmail(props: any) {
  return (
    <BaseEmailLayout previewText="MaintenanceNoticeEmail">
      <Text>This is a placeholder for MaintenanceNoticeEmail</Text>
    </BaseEmailLayout>
  );
}
