import * as React from 'react';
import BaseEmailLayout from '../layouts/BaseEmailLayout';
import { Text } from '@react-email/components';

export default function SubscriptionCreatedEmail(props: any) {
  return (
    <BaseEmailLayout previewText="SubscriptionCreatedEmail">
      <Text>This is a placeholder for SubscriptionCreatedEmail</Text>
    </BaseEmailLayout>
  );
}
