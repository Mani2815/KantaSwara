import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { Text } from '@react-email/components';

export default function OrgRegistrationSubmittedEmail(props: any) {
  return (
    <BaseEmailLayout previewText="OrgRegistrationSubmittedEmail">
      <Text>This is a placeholder for OrgRegistrationSubmittedEmail</Text>
    </BaseEmailLayout>
  );
}
