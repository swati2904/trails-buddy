import React from 'react';
import {
  Heading,
  Flex,
  Picker,
  Item,
  DatePicker,
  Text,
} from '@adobe/react-spectrum';
import { REVIEW_CONFIG } from '../../../constants/reviewConfig';

const ActivityStep = ({
  activityType,
  setActivityType,
  visitDate,
  setVisitDate,
}) => (
  <>
    <Heading level={3}>One last thing...</Heading>
    <Text>Help users put your review in context</Text>
    <Flex direction='column' gap='size-200' marginTop='size-200'>
      <Picker
        label='Activity type'
        selectedKey={activityType?.id}
        onSelectionChange={(key) =>
          setActivityType(REVIEW_CONFIG.activities.find((a) => a.id === key))
        }
      >
        {REVIEW_CONFIG.activities.map((activity) => (
          <Item key={activity.id}>{activity.label}</Item>
        ))}
      </Picker>
      <DatePicker
        label='Date visited'
        value={visitDate}
        onChange={(value) => setVisitDate(value)}
      />
    </Flex>
  </>
);

export default ActivityStep;
