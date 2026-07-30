import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { Text } from '@react-email/components';

export default function OrgApprovedEmail(props: any) {
  return (
    <BaseEmailLayout previewText="OrgApprovedEmail">
      <Text>This is a placeholder for OrgApprovedEmail</Text>
    </BaseEmailLayout>
  );
}
