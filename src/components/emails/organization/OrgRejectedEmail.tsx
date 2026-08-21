import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { Text } from '@react-email/components';

export default function OrgRejectedEmail(props: any) {
  return (
    <BaseEmailLayout previewText="OrgRejectedEmail">
      <Text>This is a placeholder for OrgRejectedEmail</Text>
    </BaseEmailLayout>
  );
}
