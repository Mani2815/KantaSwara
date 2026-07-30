import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { Text } from '@react-email/components';

export default function DeploymentFailedEmail(props: any) {
  return (
    <BaseEmailLayout previewText="DeploymentFailedEmail">
      <Text>This is a placeholder for DeploymentFailedEmail</Text>
    </BaseEmailLayout>
  );
}
