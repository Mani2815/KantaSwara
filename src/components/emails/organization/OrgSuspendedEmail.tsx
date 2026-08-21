import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { Text } from '@react-email/components';

export default function OrgSuspendedEmail(props: any) {
  return (
    <BaseEmailLayout previewText="OrgSuspendedEmail">
      <Text>This is a placeholder for OrgSuspendedEmail</Text>
    </BaseEmailLayout>
  );
}
